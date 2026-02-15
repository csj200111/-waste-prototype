package com.throwit.domain.offline;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StickerShopRepository extends JpaRepository<StickerShop, Long> {

    List<StickerShop> findByRegionId(Long regionId);
}
