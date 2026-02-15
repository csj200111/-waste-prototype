package com.throwit.domain.waste;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WasteCategoryRepository extends JpaRepository<WasteCategory, Long> {

    List<WasteCategory> findByParentIsNull();
}
