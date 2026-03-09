package com.throwit.domain.sharing.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class SharingPostCreateRequest {

    @NotBlank(message = "제목은 필수입니다")
    private String title;

    private String description;

    @NotBlank(message = "카테고리는 필수입니다")
    private String category;

    @NotBlank(message = "시도는 필수입니다")
    private String sido;

    @NotBlank(message = "시군구는 필수입니다")
    private String sigungu;

    private String dong;

    @NotBlank(message = "희망 거래 장소는 필수입니다")
    private String preferredPlace;

    private Double latitude;

    private Double longitude;

    private Long authorId;

    @NotBlank(message = "닉네임은 필수입니다")
    private String authorNickname;

    private List<String> imageUrls;

    private String status;
}
