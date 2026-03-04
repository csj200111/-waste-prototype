package com.throwit.domain.sharing.dto;

import com.throwit.domain.sharing.SharingPost;
import com.throwit.domain.sharing.SharingStatus;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Builder;
import lombok.Getter;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Getter
@Builder
public class SharingPostResponse {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    private Long id;
    private String title;
    private String description;
    private String category;
    private String status;
    private String sido;
    private String sigungu;
    private String dong;
    private String preferredPlace;
    private Double latitude;
    private Double longitude;
    private Long authorId;
    private String authorNickname;
    private List<String> imageUrls;
    private int viewCount;
    private int chatCount;
    private int scrapCount;
    private String createdAt;

    public static SharingPostResponse from(SharingPost post) {
        return SharingPostResponse.builder()
                .id(post.getId())
                .title(post.getTitle())
                .description(post.getDescription())
                .category(post.getCategory())
                .status(toKoreanStatus(post.getStatus()))
                .sido(post.getSido())
                .sigungu(post.getSigungu())
                .dong(post.getDong())
                .preferredPlace(post.getPreferredPlace())
                .latitude(post.getLatitude())
                .longitude(post.getLongitude())
                .authorId(post.getAuthorId())
                .authorNickname(post.getAuthorNickname())
                .imageUrls(parseImageUrls(post.getImageUrls()))
                .viewCount(post.getViewCount())
                .chatCount(post.getChatCount())
                .scrapCount(post.getScrapCount())
                .createdAt(toRelativeTime(post.getCreatedAt()))
                .build();
    }

    private static List<String> parseImageUrls(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    private static String toKoreanStatus(SharingStatus status) {
        return switch (status) {
            case SHARING -> "나눔중";
            case RESERVED -> "예약중";
            case COMPLETED -> "나눔완료";
        };
    }

    private static String toRelativeTime(LocalDateTime dateTime) {
        Duration duration = Duration.between(dateTime, LocalDateTime.now());
        long minutes = duration.toMinutes();
        if (minutes < 1) return "방금 전";
        if (minutes < 60) return minutes + "분 전";
        long hours = duration.toHours();
        if (hours < 24) return hours + "시간 전";
        long days = duration.toDays();
        if (days < 30) return days + "일 전";
        long months = days / 30;
        if (months < 12) return months + "달 전";
        return (days / 365) + "년 전";
    }
}
