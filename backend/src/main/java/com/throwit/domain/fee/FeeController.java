package com.throwit.domain.fee;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/fees")
@RequiredArgsConstructor
public class FeeController {

    private final FeeRepository feeRepository;

    // GET /api/fees?region={regionId}&item={wasteItemId}&size={sizeId}
    @GetMapping
    public ResponseEntity<FeeInfo> calculateFee(
            @RequestParam("region") Long regionId,
            @RequestParam("item") Long wasteItemId,
            @RequestParam("size") Long sizeId) {
        // TODO: Service 레이어로 분리, fallback 로직 추가
        return feeRepository.findByRegionIdAndWasteItemIdAndSizeId(regionId, wasteItemId, sizeId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
