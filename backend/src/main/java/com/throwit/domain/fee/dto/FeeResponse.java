package com.throwit.domain.fee.dto;

import com.throwit.domain.fee.FeeInfo;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FeeResponse {

    private Long id;
    private Long regionId;
    private Long wasteItemId;
    private Long sizeId;
    private int fee;

    public static FeeResponse from(FeeInfo feeInfo) {
        return FeeResponse.builder()
                .id(feeInfo.getId())
                .regionId(feeInfo.getRegion().getId())
                .wasteItemId(feeInfo.getWasteItem().getId())
                .sizeId(feeInfo.getSize().getId())
                .fee(feeInfo.getFee())
                .build();
    }
}
