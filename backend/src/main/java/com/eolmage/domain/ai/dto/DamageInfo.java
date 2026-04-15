package com.eolmage.domain.ai.dto;

import com.eolmage.domain.ai.DamageLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DamageInfo {
    private String type;          // "broken", "scratch", 또는 null
    private double confidence;    // 0.0 ~ 1.0
    private DamageLevel level;    // NONE, MINOR, MODERATE, SEVERE
}
