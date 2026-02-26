package com.throwit.domain.offline.dto;

import com.throwit.domain.offline.WasteFacility;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
public class WasteFacilityResponse {
    private final Long id;
    private final String name;
    private final String roadAddress;
    private final BigDecimal lat;
    private final BigDecimal lng;
    private final String businessType;
    private final String specialtyArea;
    private final String wasteInfo;
    private final String serviceArea;
    private final String phone;
    private final String managingOrganization;

    private WasteFacilityResponse(WasteFacility entity) {
        this.id = entity.getId();
        this.name = entity.getName();
        this.roadAddress = entity.getRoadAddress();
        this.lat = entity.getLat();
        this.lng = entity.getLng();
        this.businessType = entity.getBusinessType();
        this.specialtyArea = entity.getSpecialtyArea();
        this.wasteInfo = entity.getWasteInfo();
        this.serviceArea = entity.getServiceArea();
        this.phone = entity.getPhone();
        this.managingOrganization = entity.getManagingOrganization();
    }

    public static WasteFacilityResponse from(WasteFacility entity) {
        return new WasteFacilityResponse(entity);
    }
}
