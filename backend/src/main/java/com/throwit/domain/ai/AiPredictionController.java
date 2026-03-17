package com.throwit.domain.ai;

import com.throwit.domain.ai.dto.AiPredictionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiPredictionController {

    private final AiPredictionService aiPredictionService;

    @PostMapping("/predict")
    public ResponseEntity<AiPredictionResponse> predict(
            @RequestParam("image") MultipartFile image) {
        return ResponseEntity.ok(aiPredictionService.predict(image));
    }
}
