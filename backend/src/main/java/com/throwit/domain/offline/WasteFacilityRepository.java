package com.throwit.domain.offline;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface WasteFacilityRepository extends JpaRepository<WasteFacility, Long> {

    @Query("SELECT f FROM WasteFacility f WHERE f.roadAddress LIKE CONCAT(:sido, ' ', :sigungu, '%') AND f.name <> '시설명' ORDER BY f.name")
    List<WasteFacility> findBySidoAndSigungu(@Param("sido") String sido, @Param("sigungu") String sigungu);

    @Query("SELECT f FROM WasteFacility f WHERE f.roadAddress LIKE CONCAT(:sido, '%') AND f.name <> '시설명' ORDER BY f.name")
    List<WasteFacility> findBySido(@Param("sido") String sido);
}
