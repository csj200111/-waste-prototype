package com.throwit.domain.fee.dto;

import com.throwit.domain.fee.LargeWasteFee;
import lombok.Getter;

@Getter
public class FeeInfoDto {
    private final String sido;
    private final String sigungu;
    private final String wasteName;
    private final String wasteCategory;
    private String wasteStandard;
    private final String feeType;
    private final int fee;

    private FeeInfoDto(LargeWasteFee entity) {
        this.sido = entity.getSido();
        this.sigungu = entity.getSigungu();
        this.wasteName = entity.getWasteName();
        this.wasteCategory = entity.getWasteCategory();
        this.wasteStandard = entity.getWasteStandard();
        this.feeType = entity.getFeeType();
        this.fee = entity.getFee() != null ? entity.getFee() : 0;
    }

    public static FeeInfoDto from(LargeWasteFee entity) {
        return new FeeInfoDto(entity);
    }

    public void setWasteStandard(String wasteStandard) {
        this.wasteStandard = wasteStandard;
    }
}
