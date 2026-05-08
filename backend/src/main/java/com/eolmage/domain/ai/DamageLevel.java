package com.eolmage.domain.ai;

public enum DamageLevel {
    NONE,       // 손상 없음: broken/scratch 미감지
    MINOR,      // 경미한 손상: scratch conf < 0.5
    MODERATE,   // 보통 손상: scratch conf >= 0.5 또는 broken conf < 0.5
    SEVERE;     // 심한 손상: broken conf >= 0.5

    public static DamageLevel determine(String type, double confidence) {
        if (type == null) return NONE;
        if ("broken".equals(type)) {
            return confidence >= 0.5 ? SEVERE : MODERATE;
        }
        if ("scratch".equals(type)) {
            return confidence >= 0.5 ? MODERATE : MINOR;
        }
        return NONE;
    }

    public boolean isShareable() {
        return this == NONE || this == MINOR;
    }
}
