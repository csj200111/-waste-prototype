package com.throwit.domain.waste;

import com.throwit.domain.waste.dto.WasteCategoryResponse;
import com.throwit.domain.waste.dto.WasteItemResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/waste")
@RequiredArgsConstructor
public class WasteController {

    private final WasteService wasteService;

    @GetMapping("/categories")
    public ResponseEntity<List<WasteCategoryResponse>> getCategories() {
        return ResponseEntity.ok(wasteService.getCategoryTree());
    }

    @GetMapping("/items")
    public ResponseEntity<List<WasteItemResponse>> searchItems(
            @RequestParam(value = "q", required = false) String keyword) {
        return ResponseEntity.ok(wasteService.searchItems(keyword));
    }

    @GetMapping("/items/{id}")
    public ResponseEntity<WasteItemResponse> getItem(@PathVariable Long id) {
        return ResponseEntity.ok(wasteService.getItemById(id));
    }
}
