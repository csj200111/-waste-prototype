package com.throwit.domain.waste;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WasteItemRepository extends JpaRepository<WasteItem, Long> {

    List<WasteItem> findByCategoryId(Long categoryId);

    List<WasteItem> findByNameContainingIgnoreCase(String keyword);
}
