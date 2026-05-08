package com.eolmage.domain.ai;

public enum DamageLevel {
    NONE,    // 손상 없음
    MINOR,   // 경미한 손상 (scratch)
    SEVERE;  // 심한 손상 (broken)

    public static DamageLevel determine(String type, double confidence) {
        if (type == null) return NONE;
        if ("broken".equals(type)) return SEVERE;
        if ("scratch".equals(type)) return MINOR;
        return NONE;
    }

    public boolean isShareable() {
        return this == NONE || this == MINOR;
    }
}
