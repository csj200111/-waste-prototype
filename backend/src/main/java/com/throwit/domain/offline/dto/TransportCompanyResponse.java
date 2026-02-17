package com.throwit.domain.offline.dto;

import com.throwit.domain.offline.TransportCompany;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TransportCompanyResponse {

    private Long id;
    private String name;
    private String phone;
    private Long regionId;
    private String description;

    public static TransportCompanyResponse from(TransportCompany company) {
        return TransportCompanyResponse.builder()
                .id(company.getId())
                .name(company.getName())
                .phone(company.getPhone())
                .regionId(company.getRegion().getId())
                .description(company.getDescription())
                .build();
    }
}
