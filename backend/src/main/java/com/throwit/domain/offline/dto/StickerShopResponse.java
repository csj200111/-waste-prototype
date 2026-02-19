package com.throwit.domain.offline.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class StickerShopResponse {
    private Long id;
    private String name;
    private String address;
    private String phone;
    private String sigungu;
    private Double lat;
    private Double lng;
}
