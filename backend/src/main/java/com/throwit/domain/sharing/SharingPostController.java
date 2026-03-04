package com.throwit.domain.sharing;

import com.throwit.domain.sharing.dto.SharingPostCreateRequest;
import com.throwit.domain.sharing.dto.SharingPostResponse;
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
            @RequestParam(required = false) Long authorId,
            @RequestParam(required = false) String authorNickname) {
        if (authorId != null || authorNickname != null) {
            return ResponseEntity.ok(sharingPostService.getMyList(authorId, authorNickname));
        }
        return ResponseEntity.ok(sharingPostService.getList(sigungu, keyword));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SharingPostResponse> getDetail(@PathVariable Long id) {
        return ResponseEntity.ok(sharingPostService.getDetail(id));
    }

    @PostMapping
    public ResponseEntity<SharingPostResponse> create(
            @Valid @RequestBody SharingPostCreateRequest request) {
        return ResponseEntity.ok(sharingPostService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SharingPostResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody SharingPostCreateRequest request) {
        return ResponseEntity.ok(sharingPostService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        sharingPostService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
