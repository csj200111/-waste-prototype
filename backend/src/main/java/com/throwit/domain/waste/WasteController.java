package com.throwit.domain.waste;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/waste")
@RequiredArgsConstructor
public class WasteController {

    private final WasteCategoryRepository categoryRepository;
    private final WasteItemRepository itemRepository;

    // GET /api/waste/categories
    @GetMapping("/categories")
    public ResponseEntity<List<WasteCategory>> getCategories() {
        // TODO: Service 레이어로 분리, 트리 구조 DTO 변환
        return ResponseEntity.ok(categoryRepository.findByParentIsNull());
    }

    // GET /api/waste/items?q={keyword}
    @GetMapping("/items")
    public ResponseEntity<List<WasteItem>> searchItems(@RequestParam(value = "q", required = false) String keyword) {
        // TODO: Service 레이어로 분리
        if (keyword == null || keyword.isBlank()) {
            return ResponseEntity.ok(itemRepository.findAll());
        }
        return ResponseEntity.ok(itemRepository.findByNameContainingIgnoreCase(keyword));
    }

    // GET /api/waste/items/{id}
    @GetMapping("/items/{id}")
    public ResponseEntity<WasteItem> getItem(@PathVariable Long id) {
        // TODO: Service 레이어로 분리
        return itemRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
