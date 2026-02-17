package com.throwit.domain.recycle.dto;

import com.throwit.domain.recycle.RecycleItem;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Getter
@Builder
public class RecycleItemResponse {

    private Long id;
    private String userId;
    private String title;
    private String description;
    private List<String> photos;
    private Long categoryId;
    private Long regionId;
    private String address;
    private Double lat;
    private Double lng;
    private String status;
    private LocalDateTime createdAt;

    public static RecycleItemResponse from(RecycleItem item) {
        List<String> photoList = List.of();
        if (item.getPhotos() != null && !item.getPhotos().isBlank()) {
            String cleaned = item.getPhotos().replaceAll("[\\[\\]\"]", "");
            if (!cleaned.isBlank()) {
                photoList = Arrays.asList(cleaned.split(","));
            }
        }

        return RecycleItemResponse.builder()
                .id(item.getId())
                .userId(item.getUserId())
                .title(item.getTitle())
                .description(item.getDescription())
                .photos(photoList)
                .categoryId(item.getCategory().getId())
                .regionId(item.getRegion().getId())
                .address(item.getAddress())
                .lat(item.getLat())
                .lng(item.getLng())
                .status(item.getStatus().name().toLowerCase())
                .createdAt(item.getCreatedAt())
                .build();
    }
}
