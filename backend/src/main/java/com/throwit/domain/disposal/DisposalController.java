package com.throwit.domain.disposal;

import com.throwit.domain.disposal.dto.DisposalCreateRequest;
import com.throwit.domain.disposal.dto.DisposalResponse;
import com.throwit.domain.disposal.dto.PaymentRequest;
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
            @RequestHeader(value = "X-User-Id", defaultValue = "anonymous") String userId) {
        return ResponseEntity.ok(disposalService.createApplication(request, userId));
    }

    @GetMapping("/my")
    public ResponseEntity<List<DisposalResponse>> getMyApplications(
            @RequestHeader(value = "X-User-Id", defaultValue = "anonymous") String userId) {
        return ResponseEntity.ok(disposalService.getMyApplications(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DisposalResponse> getApplication(@PathVariable Long id) {
        return ResponseEntity.ok(disposalService.getApplication(id));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<DisposalResponse> cancelApplication(@PathVariable Long id) {
        return ResponseEntity.ok(disposalService.cancelApplication(id));
    }

    @PostMapping("/{id}/payment")
    public ResponseEntity<DisposalResponse> processPayment(
            @PathVariable Long id,
            @Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.ok(disposalService.processPayment(id, request));
    }
}
