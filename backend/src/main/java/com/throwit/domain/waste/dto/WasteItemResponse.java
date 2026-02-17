package com.throwit.domain.waste.dto;

import com.throwit.domain.waste.WasteItem;
import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
public class WasteItemResponse {

    private Long id;
    private Long categoryId;
    private String name;
    private List<WasteSizeResponse> sizes;

    public static WasteItemResponse from(WasteItem item) {
        return WasteItemResponse.builder()
                .id(item.getId())
                .categoryId(item.getCategory().getId())
                .name(item.getName())
                .sizes(item.getSizes() != null
                        ? item.getSizes().stream()
                            .map(WasteSizeResponse::from)
                            .collect(Collectors.toList())
                        : List.of())
                .build();
    }
}
