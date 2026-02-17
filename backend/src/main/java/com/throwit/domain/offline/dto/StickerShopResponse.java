package com.throwit.domain.offline.dto;

import com.throwit.domain.offline.StickerShop;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class StickerShopResponse {

    private Long id;
    private String name;
    private String address;
    private String phone;
    private Long regionId;
    private Double lat;
    private Double lng;

    public static StickerShopResponse from(StickerShop shop) {
        return StickerShopResponse.builder()
                .id(shop.getId())
                .name(shop.getName())
                .address(shop.getAddress())
                .phone(shop.getPhone())
                .regionId(shop.getRegion().getId())
                .lat(shop.getLat())
                .lng(shop.getLng())
                .build();
    }
}
