package com.throwit.domain.fee;

import com.throwit.domain.fee.dto.FeeInfoDto;
import com.throwit.domain.fee.dto.WasteItemResult;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class LargeWasteFeeController {

    private final LargeWasteFeeService service;

    // 시도 목록
    @GetMapping("/api/regions/sido")
    public ResponseEntity<List<String>> getSido() {
        return ResponseEntity.ok(service.getSido());
    }

    // 시군구 목록 (시도 기준)
    @GetMapping("/api/regions/sigungu")
    public ResponseEntity<List<String>> getSigungu(@RequestParam String sido) {
        return ResponseEntity.ok(service.getSigungu(sido));
    }

    // 폐기물 카테고리 목록
    @GetMapping("/api/waste/categories")
    public ResponseEntity<List<String>> getCategories() {
        return ResponseEntity.ok(service.getCategories());
    }

    // 폐기물 항목 검색 (지역 + 카테고리 + 키워드)
    @GetMapping("/api/waste/items")
    public ResponseEntity<List<WasteItemResult>> searchItems(
            @RequestParam String sigungu,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(service.searchWasteItems(sigungu, category, keyword));
    }

    // 수수료 조회 (시도 + 시군구 + 폐기물명 → 규격별 수수료 목록)
    @GetMapping("/api/fees")
    public ResponseEntity<List<FeeInfoDto>> getFees(
            @RequestParam String sido,
            @RequestParam String sigungu,
            @RequestParam String wasteName) {
        return ResponseEntity.ok(service.getFees(sido, sigungu, wasteName));
    }
}
