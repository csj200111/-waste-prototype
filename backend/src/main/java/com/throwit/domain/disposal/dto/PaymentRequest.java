package com.throwit.domain.disposal.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class PaymentRequest {

    @NotBlank(message = "결제 방법은 필수입니다")
    private String paymentMethod; // "CARD" or "TRANSFER"
}
