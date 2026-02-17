package com.throwit.domain.recycle.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class RecycleCreateRequest {

    @NotBlank(message = "물품명은 필수입니다")
    private String title;

    @NotBlank(message = "설명은 필수입니다")
    private String description;

    private List<String> photos;

    @NotNull(message = "카테고리 ID는 필수입니다")
    private Long categoryId;

    @NotNull(message = "지역 ID는 필수입니다")
    private Long regionId;

    @NotBlank(message = "주소는 필수입니다")
    private String address;

    private Double lat;
    private Double lng;
}
