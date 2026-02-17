package com.throwit.domain.disposal.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Getter
@NoArgsConstructor
public class DisposalCreateRequest {

    @NotNull(message = "지역 ID는 필수입니다")
    private Long regionId;

    @NotBlank(message = "배출 주소는 필수입니다")
    private String disposalAddress;

    @NotNull(message = "배출 희망일은 필수입니다")
    private LocalDate preferredDate;

    @NotEmpty(message = "배출 품목은 1개 이상이어야 합니다")
    @Valid
    private List<DisposalItemRequest> items;
}
