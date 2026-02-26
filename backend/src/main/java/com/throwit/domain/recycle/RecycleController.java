package com.throwit.domain.recycle;

import com.throwit.domain.recycle.dto.RecycleCreateRequest;
import com.throwit.domain.recycle.dto.RecycleItemResponse;
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
            @RequestHeader(value = "X-User-Id", defaultValue = "anonymous") String userId) {
        return ResponseEntity.ok(recycleService.getMyItems(userId));
    }

    @PostMapping("/items")
    public ResponseEntity<RecycleItemResponse> registerItem(
            @Valid @RequestBody RecycleCreateRequest request,
            @RequestHeader(value = "X-User-Id", defaultValue = "anonymous") String userId) {
        return ResponseEntity.ok(recycleService.registerItem(request, userId));
    }

    @PatchMapping("/items/{id}/status")
    public ResponseEntity<RecycleItemResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam("status") String status) {
        return ResponseEntity.ok(recycleService.updateStatus(id, status));
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        recycleService.deleteItem(id);
        return ResponseEntity.noContent().build();
    }
}
