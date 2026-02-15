package com.throwit.domain.fee;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FeeRepository extends JpaRepository<FeeInfo, Long> {

    Optional<FeeInfo> findByRegionIdAndWasteItemIdAndSizeId(Long regionId, Long wasteItemId, Long sizeId);
}
