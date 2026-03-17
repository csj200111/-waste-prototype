package com.throwit.domain.recycle.dto;

import jakarta.validation.constraints.NotBlank;
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

    private String sido;

    private String sigungu;

    @NotBlank(message = "주소는 필수입니다")
    private String address;

    private Double lat;
    private Double lng;
}
