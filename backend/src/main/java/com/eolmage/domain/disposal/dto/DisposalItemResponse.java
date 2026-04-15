package com.eolmage.domain.disposal.dto;

import com.eolmage.domain.disposal.DisposalItem;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DisposalItemResponse {

    private Long id;
    private String wasteItemName;
    private String sizeLabel;
    private int quantity;
    private int fee;
    private String photoUrl;

    public static DisposalItemResponse from(DisposalItem item) {
        return DisposalItemResponse.builder()
                .id(item.getId())
                .wasteItemName(item.getWasteItemName())
                .sizeLabel(item.getSizeLabel())
                .quantity(item.getQuantity())
                .fee(item.getFee())
                .photoUrl(item.getPhotoUrl())
                .build();
    }
}
