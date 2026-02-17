package com.throwit.domain.region;

import com.throwit.domain.region.dto.RegionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/regions")
@RequiredArgsConstructor
public class RegionController {

    private final RegionService regionService;

    @GetMapping
    public ResponseEntity<List<RegionResponse>> getRegions() {
        return ResponseEntity.ok(regionService.getAllRegions());
    }

    @GetMapping("/search")
    public ResponseEntity<List<RegionResponse>> searchRegions(@RequestParam("q") String query) {
        return ResponseEntity.ok(regionService.searchRegions(query));
    }
}
