package com.throwit.domain.recycle;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recycle")
@RequiredArgsConstructor
public class RecycleController {

    private final RecycleRepository recycleRepository;

    // GET /api/recycle/items?region={regionId}
    @GetMapping("/items")
    public ResponseEntity<List<RecycleItem>> getItems(
            @RequestParam(value = "region", required = false) Long regionId) {
        // TODO: Service 레이어로 분리
        if (regionId != null) {
            return ResponseEntity.ok(recycleRepository.findByRegionIdOrderByCreatedAtDesc(regionId));
        }
        return ResponseEntity.ok(recycleRepository.findAllByOrderByCreatedAtDesc());
    }

    // POST /api/recycle/items
    @PostMapping("/items")
    public ResponseEntity<Map<String, String>> registerItem(@RequestBody Map<String, Object> request) {
        // TODO: Service 레이어 구현 - DTO 변환, 저장
        return ResponseEntity.ok(Map.of("message", "TODO: 역경매 물품 등록"));
    }
}
