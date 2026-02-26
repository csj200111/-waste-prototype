package com.throwit.domain.disposal.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class DisposalItemRequest {

    @NotBlank(message = "폐기물 항목명은 필수입니다")
    private String wasteItemName;

    @NotBlank(message = "규격은 필수입니다")
    private String sizeLabel;

    @Min(value = 1, message = "수량은 1개 이상이어야 합니다")
    private int quantity;

    @Min(value = 0, message = "수수료는 0원 이상이어야 합니다")
    private int fee;

    private String photoUrl;
}
