package com.eolmage.domain.offline.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TransportCompanyResponse {
    private Long id;
    private String name;
    private String phone;
    private String sigungu;
    private String description;
}
