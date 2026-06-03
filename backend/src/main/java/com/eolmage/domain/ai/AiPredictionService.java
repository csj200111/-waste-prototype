package com.eolmage.domain.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.eolmage.domain.ai.dto.AiPredictionResponse;
import com.eolmage.domain.ai.dto.DamageInfo;
import com.eolmage.global.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.SocketTimeoutException;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AiPredictionService {

    private final WasteNameMapper wasteNameMapper;
    private final ObjectMapper objectMapper;

    @Value("${ai.server.url:http://localhost:5001}")
    private String aiServerUrl;

    @Value("${ai.server.timeout:60000}")
    private int aiServerTimeout;

    private static final int MAX_RESULTS = 3;
    private static final double MIN_CONFIDENCE = 0.35;

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

        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(aiServerTimeout);
        factory.setReadTimeout(aiServerTimeout);
        RestTemplate restTemplate = new RestTemplate(factory);

        ResponseEntity<String> response;
        try {
            response = restTemplate.postForEntity(aiServerUrl + "/predict", requestEntity, String.class);
        } catch (ResourceAccessException e) {
            if (e.getCause() instanceof SocketTimeoutException) {
                throw new BusinessException(
                        HttpStatus.GATEWAY_TIMEOUT,
                        "AI_SERVER_TIMEOUT",
                        "AI 분석 시간이 초과되었습니다. 잠시 후 다시 시도해주세요."
                );
            }
            throw new BusinessException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "AI_SERVER_UNAVAILABLE",
                    "AI 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요."
            );
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

            String source = root.path("source").asText("yolo");
            JsonNode predictionsNode = root.path("predictions");

            // Ollama fallback 경로: confidence/RELIABLE_CLASSES 필터 없이 직접 파싱
            if ("ollama".equals(source)) {
                return parseOllamaResponse(root, predictionsNode);
            }

            // YOLO 경로: 기존 로직 유지
            return parseYoloResponse(root, predictionsNode);

        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw BusinessException.badRequest("AI_RESPONSE_PARSE_ERROR", "AI 서버 응답을 처리할 수 없습니다.");
        }
    }

    /** Ollama fallback: confidence/RELIABLE_CLASSES 필터 없이 품목명 직접 매핑 */
    private AiPredictionResponse parseOllamaResponse(JsonNode root, JsonNode predictionsNode) {
        List<AiPredictionResponse.PredictionItem> items = new ArrayList<>();

        for (JsonNode node : predictionsNode) {
            String className = node.path("className").asText();
            if (className.isEmpty()) continue;

            WasteNameMapper.MappedWaste mapped = wasteNameMapper.map(className);
            if (mapped == null) continue;

            items.add(AiPredictionResponse.PredictionItem.builder()
                    .className(className)
                    .confidence(0.0)   // Ollama는 수치 없음
                    .wasteName(mapped.getWasteName())
                    .wasteCategory(mapped.getWasteCategory())
                    .build());
        }

        // damage: ai-server가 이미 level 문자열로 전달 → DamageLevel.valueOf()로 직접 파싱
        JsonNode damageNode = root.path("damage");
        JsonNode typeNode = damageNode.path("type");
        String damageType = (typeNode.isNull() || typeNode.isMissingNode()) ? null : typeNode.asText();
        if (damageType != null && damageType.isEmpty()) damageType = null;

        DamageLevel level;
        try {
            level = DamageLevel.valueOf(damageNode.path("level").asText("NONE"));
        } catch (IllegalArgumentException e) {
            level = DamageLevel.NONE;
        }

        DamageInfo damage = DamageInfo.builder()
                .type(damageType)
                .confidence(0.0)
                .level(level)
                .build();

        return AiPredictionResponse.builder()
                .predictions(items)
                .totalCount(items.size())
                .damage(damage)
                .source("ollama")
                .build();
    }

    /** YOLO 경로: 기존 필터(RELIABLE_CLASSES, MIN_CONFIDENCE) 그대로 유지 */
    private AiPredictionResponse parseYoloResponse(JsonNode root, JsonNode predictionsNode) {
        List<AiPredictionResponse.PredictionItem> items = new ArrayList<>();
        String damageType = null;
        double damageConfidence = 0.0;

        for (JsonNode node : predictionsNode) {
            String className = node.path("className").asText();
            double confidence = node.path("confidence").asDouble();

            // 기존 방식: detection에서 broken/scratch가 오면 필터링
            if ("broken".equals(className) || "scratch".equals(className)) {
                if (damageType == null
                        || ("broken".equals(className) && !"broken".equals(damageType))
                        || (className.equals(damageType) && confidence > damageConfidence)) {
                    damageType = className;
                    damageConfidence = confidence;
                }
                continue;
            }

            // 새 방식: 각 prediction에 damageClass/damageConfidence 필드
            if (node.has("damageClass")) {
                String dc = node.path("damageClass").asText();
                double dcConf = node.path("damageConfidence").asDouble();
                if ("broken".equals(dc) || "scratch".equals(dc)) {
                    if (damageType == null
                            || ("broken".equals(dc) && !"broken".equals(damageType))
                            || (dc.equals(damageType) && dcConf > damageConfidence)) {
                        damageType = dc;
                        damageConfidence = dcConf;
                    }
                }
            }

            if (!WasteNameMapper.RELIABLE_CLASSES.contains(className)) {
                continue;
            }

            if (confidence < MIN_CONFIDENCE) {
                continue;
            }

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

        DamageLevel level = DamageLevel.determine(damageType, damageConfidence);
        DamageInfo damage = DamageInfo.builder()
                .type(damageType)
                .confidence(Math.round(damageConfidence * 10000.0) / 10000.0)
                .level(level)
                .build();

        return AiPredictionResponse.builder()
                .predictions(items)
                .totalCount(items.size())
                .damage(damage)
                .source("yolo")
                .build();
    }
}
