package com.eolmage.domain.disposal;

import com.eolmage.domain.disposal.dto.DisposalCreateRequest;
import com.eolmage.domain.disposal.dto.DisposalResponse;
import com.eolmage.domain.disposal.dto.PaymentRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/disposals")
@RequiredArgsConstructor
public class DisposalController {

    private final DisposalService disposalService;

    @PostMapping
    public ResponseEntity<DisposalResponse> createApplication(
            @Valid @RequestBody DisposalCreateRequest request,
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(disposalService.createApplication(request, userId));
    }

    @GetMapping("/my")
    public ResponseEntity<List<DisposalResponse>> getMyApplications(
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(disposalService.getMyApplications(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DisposalResponse> getApplication(@PathVariable Long id) {
        return ResponseEntity.ok(disposalService.getApplication(id));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<DisposalResponse> cancelApplication(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(disposalService.cancelApplication(id, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApplication(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") String userId) {
        disposalService.deleteApplication(id, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/payment")
    public ResponseEntity<DisposalResponse> processPayment(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") String userId,
            @Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.ok(disposalService.processPayment(id, userId, request));
    }
}
