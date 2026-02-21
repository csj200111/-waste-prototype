package com.throwit.domain.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiPredictionResponse {

    private List<PredictionItem> predictions;
    private int totalCount;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PredictionItem {
        private String className;
        private double confidence;
        private String wasteName;
        private String wasteCategory;
    }
}
