package com.eolmage.domain.fee.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@AllArgsConstructor
public class WasteSpecFeeResponse {
    private String wasteName;
    private List<SpecFee> specs;

    @Getter
    @AllArgsConstructor
    public static class SpecFee {
        private String standard;
        private int fee;
    }

    public static WasteSpecFeeResponse from(String wasteName, List<FeeInfoDto> fees) {
        List<SpecFee> specs = fees.stream()
                .map(f -> new SpecFee(
                        f.getWasteStandard() != null ? f.getWasteStandard() : "일반",
                        f.getFee()))
                .collect(Collectors.toList());
        return new WasteSpecFeeResponse(wasteName, specs);
    }
}
