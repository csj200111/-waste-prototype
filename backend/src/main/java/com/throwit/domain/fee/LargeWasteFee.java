package com.throwit.domain.fee;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "large_waste_fee")
@Getter
@NoArgsConstructor
public class LargeWasteFee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "시도명")
    private String sido;

    @Column(name = "시군구명")
    private String sigungu;

    @Column(name = "대형폐기물명")
    private String wasteName;

    @Column(name = "대형폐기물구분명")
    private String wasteCategory;

    @Column(name = "대형폐기물규격")
    private String wasteStandard;

    @Column(name = "유무료여부")
    private String feeType;

    @Column(name = "수수료")
    private Integer fee;

    @Column(name = "관리기관명")
    private String managingOrganization;

    @Column(name = "데이터기준일자")
    private LocalDate dataBaseDate;
}
