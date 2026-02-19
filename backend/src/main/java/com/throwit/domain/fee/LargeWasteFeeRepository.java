package com.throwit.domain.fee;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LargeWasteFeeRepository extends JpaRepository<LargeWasteFee, Long> {

    @Query("SELECT DISTINCT f.sido FROM LargeWasteFee f WHERE f.sido IS NOT NULL AND f.sido <> '시도명' ORDER BY f.sido")
    List<String> findDistinctSido();

    @Query("SELECT DISTINCT f.sigungu FROM LargeWasteFee f WHERE f.sido = :sido AND f.sigungu IS NOT NULL AND f.sigungu <> '시군구명' ORDER BY f.sigungu")
    List<String> findDistinctSigunguBySido(@Param("sido") String sido);

    @Query("SELECT DISTINCT f.wasteCategory FROM LargeWasteFee f WHERE f.wasteCategory IS NOT NULL AND f.wasteCategory <> '대형폐기물구분명' ORDER BY f.wasteCategory")
    List<String> findDistinctCategories();

    @Query("SELECT DISTINCT f.wasteName, f.wasteCategory FROM LargeWasteFee f " +
           "WHERE f.sigungu = :sigungu " +
           "AND (:category IS NULL OR f.wasteCategory = :category) " +
           "AND (:keyword IS NULL OR f.wasteName LIKE %:keyword%) " +
           "ORDER BY f.wasteName")
    List<Object[]> findWasteItems(@Param("sigungu") String sigungu,
                                   @Param("category") String category,
                                   @Param("keyword") String keyword);

    List<LargeWasteFee> findBySidoAndSigunguAndWasteName(String sido, String sigungu, String wasteName);
}
