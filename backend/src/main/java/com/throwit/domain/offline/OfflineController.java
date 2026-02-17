package com.throwit.domain.offline;

import com.throwit.domain.offline.dto.CommunityCenterResponse;
import com.throwit.domain.offline.dto.StickerShopResponse;
import com.throwit.domain.offline.dto.TransportCompanyResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/offline")
@RequiredArgsConstructor
public class OfflineController {

    private final OfflineService offlineService;

    @GetMapping("/sticker-shops")
    public ResponseEntity<List<StickerShopResponse>> getStickerShops(
            @RequestParam(value = "region", required = false) Long regionId) {
        return ResponseEntity.ok(offlineService.getStickerShops(regionId));
    }

    @GetMapping("/centers")
    public ResponseEntity<List<CommunityCenterResponse>> getCenters(
            @RequestParam(value = "region", required = false) Long regionId) {
        return ResponseEntity.ok(offlineService.getCenters(regionId));
    }

    @GetMapping("/transport")
    public ResponseEntity<List<TransportCompanyResponse>> getTransportCompanies(
            @RequestParam(value = "region", required = false) Long regionId) {
        return ResponseEntity.ok(offlineService.getTransportCompanies(regionId));
    }
}
