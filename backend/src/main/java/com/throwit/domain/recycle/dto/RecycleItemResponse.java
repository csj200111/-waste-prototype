package com.throwit.domain.recycle.dto;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.throwit.domain.recycle.RecycleItem;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class RecycleItemResponse {

    private Long id;
    private String userId;
    private String title;
    private String description;
    private List<String> photos;
    private String sido;
    private String sigungu;
    private String address;
    private Double lat;
    private Double lng;
    private String status;
    private LocalDateTime createdAt;

    private static final ObjectMapper mapper = new ObjectMapper();

    public static RecycleItemResponse from(RecycleItem item) {
        List<String> photoList = List.of();
        if (item.getPhotos() != null && !item.getPhotos().isBlank()) {
            try {
                photoList = mapper.readValue(item.getPhotos(), new TypeReference<List<String>>() {});
            } catch (JsonProcessingException e) {
                photoList = List.of();
            }
        }

        return RecycleItemResponse.builder()
                .id(item.getId())
                .userId(item.getUserId())
                .title(item.getTitle())
                .description(item.getDescription())
                .photos(photoList)
                .sido(item.getSido())
                .sigungu(item.getSigungu())
                .address(item.getAddress())
                .lat(item.getLat())
                .lng(item.getLng())
                .status(item.getStatus().name().toLowerCase())
                .createdAt(item.getCreatedAt())
                .build();
    }
}
