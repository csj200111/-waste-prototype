package com.throwit.domain.offline.dto;

import com.throwit.domain.offline.CommunityCenter;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CommunityCenterResponse {

    private Long id;
    private String name;
    private String address;
    private String phone;
    private Long regionId;
    private Double lat;
    private Double lng;

    public static CommunityCenterResponse from(CommunityCenter center) {
        return CommunityCenterResponse.builder()
                .id(center.getId())
                .name(center.getName())
                .address(center.getAddress())
                .phone(center.getPhone())
                .regionId(center.getRegion().getId())
                .lat(center.getLat())
                .lng(center.getLng())
                .build();
    }
}
