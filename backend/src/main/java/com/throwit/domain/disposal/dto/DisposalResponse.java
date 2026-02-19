package com.throwit.domain.disposal.dto;

import com.throwit.domain.disposal.DisposalApplication;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
public class DisposalResponse {

    private Long id;
    private String applicationNumber;
    private String userId;
    private String sido;
    private String sigungu;
    private String disposalAddress;
    private LocalDate preferredDate;
    private int totalFee;
    private String status;
    private String paymentMethod;
    private List<DisposalItemResponse> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static DisposalResponse from(DisposalApplication app) {
        return DisposalResponse.builder()
                .id(app.getId())
                .applicationNumber(app.getApplicationNumber())
                .userId(app.getUserId())
                .sido(app.getSido())
                .sigungu(app.getSigungu())
                .disposalAddress(app.getDisposalAddress())
                .preferredDate(app.getPreferredDate())
                .totalFee(app.getTotalFee())
                .status(app.getStatus().name().toLowerCase())
                .paymentMethod(app.getPaymentMethod() != null ? app.getPaymentMethod().name().toLowerCase() : null)
                .items(app.getItems().stream()
                        .map(DisposalItemResponse::from)
                        .collect(Collectors.toList()))
                .createdAt(app.getCreatedAt())
                .updatedAt(app.getUpdatedAt())
                .build();
    }
}
