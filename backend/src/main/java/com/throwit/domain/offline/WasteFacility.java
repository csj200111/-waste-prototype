package com.throwit.domain.offline;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "waste_facility")
@Getter
@NoArgsConstructor
public class WasteFacility {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "시설명")
    private String name;

    @Column(name = "소재지도로명주소")
    private String roadAddress;

    @Column(name = "소재지지번주소")
    private String lotAddress;

    @Column(name = "위도")
    private BigDecimal lat;

    @Column(name = "경도")
    private BigDecimal lng;

    @Column(name = "업종명")
    private String businessType;

    @Column(name = "전문처리분야명")
    private String specialtyArea;

    @Column(name = "처리폐기물정보")
    private String wasteInfo;

    @Column(name = "영업구역")
    private String serviceArea;

    @Column(name = "시설장비명")
    private String equipmentName;

    @Column(name = "허가일자")
    private LocalDate permitDate;

    @Column(name = "전화번호")
    private String phone;

    @Column(name = "관리기관명")
    private String managingOrganization;

    @Column(name = "데이터기준일자")
    private LocalDate dataBaseDate;

    @Column(name = "제공기관코드")
    private String providerCode;

    @Column(name = "제공기관명")
    private String providerName;
}
