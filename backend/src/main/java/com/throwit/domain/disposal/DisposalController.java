package com.throwit.domain.disposal;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/disposals")
@RequiredArgsConstructor
public class DisposalController {

    private final DisposalRepository disposalRepository;

    // POST /api/disposals
    @PostMapping
    public ResponseEntity<Map<String, String>> createApplication(@RequestBody Map<String, Object> request) {
        // TODO: Service 레이어 구현 - DTO 변환, 배출번호 생성, 저장
        return ResponseEntity.ok(Map.of("message", "TODO: 배출 신청 생성"));
    }

    // GET /api/disposals/my
    @GetMapping("/my")
    public ResponseEntity<List<DisposalApplication>> getMyApplications() {
        // TODO: Service 레이어 구현 - 인증된 사용자의 신청 내역 조회
        return ResponseEntity.ok(Collections.emptyList());
    }

    // PATCH /api/disposals/{id}/cancel
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Map<String, String>> cancelApplication(@PathVariable Long id) {
        // TODO: Service 레이어 구현 - 상태 변경 (paid/scheduled → cancelled)
        return ResponseEntity.ok(Map.of("message", "TODO: 신청 취소"));
    }

    // POST /api/disposals/{id}/payment
    @PostMapping("/{id}/payment")
    public ResponseEntity<Map<String, String>> processPayment(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        // TODO: Service 레이어 구현 - 결제 처리 (Mock)
        return ResponseEntity.ok(Map.of("message", "TODO: 결제 처리"));
    }
}
