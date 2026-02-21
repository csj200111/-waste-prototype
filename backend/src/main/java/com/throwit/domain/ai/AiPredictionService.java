package com.throwit.domain.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.throwit.domain.ai.dto.AiPredictionResponse;
import com.throwit.global.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AiPredictionService {

    private final WasteNameMapper wasteNameMapper;
    private final ObjectMapper objectMapper;

    @Value("${ai.server.url:http://localhost:5000}")
    private String aiServerUrl;

    private static final int MAX_RESULTS = 3;

    public AiPredictionResponse predict(MultipartFile image) {
        byte[] imageBytes;
        try {
            imageBytes = image.getBytes();
        } catch (IOException e) {
            throw BusinessException.badRequest("IMAGE_READ_ERROR", "이미지 파일을 읽을 수 없습니다.");
        }

        String originalFilename = image.getOriginalFilename() != null ? image.getOriginalFilename() : "image.jpg";

        ByteArrayResource resource = new ByteArrayResource(imageBytes) {
            @Override
            public String getFilename() {
                return originalFilename;
            }
        };

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("image", resource);

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
        RestTemplate restTemplate = new RestTemplate();

        ResponseEntity<String> response;
        try {
            response = restTemplate.postForEntity(aiServerUrl + "/predict", requestEntity, String.class);
        } catch (RestClientException e) {
            throw new BusinessException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "AI_SERVER_UNAVAILABLE",
                    "AI 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요."
            );
        }

        return parseResponse(response.getBody());
    }

    private AiPredictionResponse parseResponse(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);

            if (!root.path("success").asBoolean(false)) {
                String error = root.path("error").asText("Unknown error");
                throw BusinessException.badRequest("AI_PREDICTION_FAILED", "AI 분석 실패: " + error);
            }

            JsonNode predictionsNode = root.path("predictions");
            List<AiPredictionResponse.PredictionItem> items = new ArrayList<>();

            for (JsonNode node : predictionsNode) {
                String className = node.path("className").asText();
                double confidence = node.path("confidence").asDouble();

                WasteNameMapper.MappedWaste mapped = wasteNameMapper.map(className);
                if (mapped == null) {
                    continue;
                }

                items.add(AiPredictionResponse.PredictionItem.builder()
                        .className(className)
                        .confidence(confidence)
                        .wasteName(mapped.getWasteName())
                        .wasteCategory(mapped.getWasteCategory())
                        .build());

                if (items.size() >= MAX_RESULTS) {
                    break;
                }
            }

            return AiPredictionResponse.builder()
                    .predictions(items)
                    .totalCount(items.size())
                    .build();

        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw BusinessException.badRequest("AI_RESPONSE_PARSE_ERROR", "AI 서버 응답을 처리할 수 없습니다.");
        }
    }
}
