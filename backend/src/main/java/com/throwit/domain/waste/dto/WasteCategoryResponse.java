package com.throwit.domain.waste.dto;

import com.throwit.domain.waste.WasteCategory;
import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
public class WasteCategoryResponse {

    private Long id;
    private String name;
    private Long parentId;
    private List<WasteCategoryResponse> children;

    public static WasteCategoryResponse from(WasteCategory category) {
        return WasteCategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .children(category.getChildren() != null
                        ? category.getChildren().stream()
                            .map(WasteCategoryResponse::from)
                            .collect(Collectors.toList())
                        : List.of())
                .build();
    }
}
