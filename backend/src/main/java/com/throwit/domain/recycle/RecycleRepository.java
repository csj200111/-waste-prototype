package com.throwit.domain.recycle;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RecycleRepository extends JpaRepository<RecycleItem, Long> {

    List<RecycleItem> findByRegionIdOrderByCreatedAtDesc(Long regionId);

    List<RecycleItem> findAllByOrderByCreatedAtDesc();
}
