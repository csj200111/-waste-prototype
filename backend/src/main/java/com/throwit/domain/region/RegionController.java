package com.throwit.domain.region;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/regions")
@RequiredArgsConstructor
public class RegionController {

    private final RegionRepository regionRepository;

    // GET /api/regions
    @GetMapping
    public ResponseEntity<List<Region>> getRegions() {
        // TODO: Service 레이어로 분리
        return ResponseEntity.ok(regionRepository.findAll());
    }

    // GET /api/regions/search?q={query}
    @GetMapping("/search")
    public ResponseEntity<List<Region>> searchRegions(@RequestParam("q") String query) {
        // TODO: Service 레이어로 분리
        return ResponseEntity.ok(regionRepository.searchByQuery(query));
    }
}
