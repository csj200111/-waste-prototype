package com.eolmage.domain.recycle;

import com.eolmage.domain.recycle.dto.RecycleCreateRequest;
import com.eolmage.domain.recycle.dto.RecycleItemResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recycle")
@RequiredArgsConstructor
public class RecycleController {

    private final RecycleService recycleService;

    @GetMapping("/items")
    public ResponseEntity<List<RecycleItemResponse>> getItems(
            @RequestParam(required = false) String sigungu) {
        return ResponseEntity.ok(recycleService.getItems(sigungu));
    }

    @GetMapping("/items/my")
    public ResponseEntity<List<RecycleItemResponse>> getMyItems(
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(recycleService.getMyItems(userId));
    }

    @PostMapping("/items")
    public ResponseEntity<RecycleItemResponse> registerItem(
            @Valid @RequestBody RecycleCreateRequest request,
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(recycleService.registerItem(request, userId));
    }

    @PatchMapping("/items/{id}/status")
    public ResponseEntity<RecycleItemResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam("status") String status,
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(recycleService.updateStatus(id, status, userId));
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<Void> deleteItem(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") String userId) {
        recycleService.deleteItem(id, userId);
        return ResponseEntity.noContent().build();
    }
}
