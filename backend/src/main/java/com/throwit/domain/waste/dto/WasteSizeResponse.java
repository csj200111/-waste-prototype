package com.throwit.domain.waste.dto;

import com.throwit.domain.waste.WasteSize;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class WasteSizeResponse {

    private Long id;
    private String label;
    private String description;

    public static WasteSizeResponse from(WasteSize size) {
        return WasteSizeResponse.builder()
                .id(size.getId())
                .label(size.getLabel())
                .description(size.getDescription())
                .build();
    }
}
