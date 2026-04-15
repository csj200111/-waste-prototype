package com.eolmage.domain.sharing;

import com.eolmage.domain.sharing.dto.SharingPostCreateRequest;
import com.eolmage.domain.sharing.dto.SharingPostResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sharing")
@RequiredArgsConstructor
public class SharingPostController {

    private final SharingPostService sharingPostService;

    @GetMapping
    public ResponseEntity<List<SharingPostResponse>> getList(
            @RequestParam(required = false) String sigungu,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long authorId) {
        if (authorId != null) {
            return ResponseEntity.ok(sharingPostService.getMyList(authorId));
        }
        return ResponseEntity.ok(sharingPostService.getList(sigungu, keyword));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SharingPostResponse> getDetail(@PathVariable Long id) {
        return ResponseEntity.ok(sharingPostService.getDetail(id));
    }

    @PostMapping
    public ResponseEntity<SharingPostResponse> create(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody SharingPostCreateRequest request) {
        return ResponseEntity.ok(sharingPostService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SharingPostResponse> update(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody SharingPostCreateRequest request) {
        return ResponseEntity.ok(sharingPostService.update(id, userId, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId) {
        sharingPostService.delete(id, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/scrap")
    public ResponseEntity<java.util.Map<String, Boolean>> toggleScrap(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") String userId) {
        boolean scrapped = sharingPostService.toggleScrap(id, userId);
        return ResponseEntity.ok(java.util.Map.of("scrapped", scrapped));
    }

    @GetMapping("/{id}/scrap")
    public ResponseEntity<java.util.Map<String, Boolean>> isScrapped(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") String userId) {
        boolean scrapped = sharingPostService.isScrapped(id, userId);
        return ResponseEntity.ok(java.util.Map.of("scrapped", scrapped));
    }

    @GetMapping("/scraps")
    public ResponseEntity<List<SharingPostResponse>> getMyScraps(
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(sharingPostService.getMyScraps(userId));
    }

    @GetMapping("/chatted")
    public ResponseEntity<List<SharingPostResponse>> getChattedPosts(
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(sharingPostService.getChattedPosts(userId));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<SharingPostResponse> completeTransaction(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long ownerId,
            @RequestBody java.util.Map<String, Long> body) {
        Long receiverId = body.get("receiverId");
        return ResponseEntity.ok(sharingPostService.completeTransaction(id, receiverId, ownerId));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<SharingPostResponse> cancelTransaction(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long ownerId) {
        return ResponseEntity.ok(sharingPostService.cancelTransaction(id, ownerId));
    }

    @GetMapping("/received")
    public ResponseEntity<List<SharingPostResponse>> getReceivedPosts(
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(sharingPostService.getReceivedPosts(userId));
    }
}
