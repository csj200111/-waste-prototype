package com.throwit.domain.fee;

import com.throwit.domain.fee.dto.FeeResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/fees")
@RequiredArgsConstructor
public class FeeController {

    private final FeeService feeService;

    @GetMapping
    public ResponseEntity<FeeResponse> calculateFee(
            @RequestParam("region") Long regionId,
            @RequestParam("item") Long wasteItemId,
            @RequestParam("size") Long sizeId) {
        return ResponseEntity.ok(feeService.calculateFee(regionId, wasteItemId, sizeId));
    }
}
