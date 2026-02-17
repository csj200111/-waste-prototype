package com.throwit.domain.region.dto;

import com.throwit.domain.region.Region;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RegionResponse {

    private Long id;
    private String city;
    private String district;
    private String dong;

    public static RegionResponse from(Region region) {
        return RegionResponse.builder()
                .id(region.getId())
                .city(region.getCity())
                .district(region.getDistrict())
                .dong(region.getDong())
                .build();
    }
}
