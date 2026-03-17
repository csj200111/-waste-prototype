package com.throwit.domain.offline;

import com.throwit.domain.offline.dto.CommunityCenterResponse;
import com.throwit.domain.offline.dto.StickerShopResponse;
import com.throwit.domain.offline.dto.TransportCompanyResponse;
import com.throwit.domain.offline.dto.WasteFacilityResponse;
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
            @RequestParam(required = false) String sigungu) {
        return ResponseEntity.ok(offlineService.getStickerShops(sigungu));
    }

    @GetMapping("/centers")
    public ResponseEntity<List<CommunityCenterResponse>> getCenters(
            @RequestParam(required = false) String sigungu) {
        return ResponseEntity.ok(offlineService.getCenters(sigungu));
    }

    @GetMapping("/transport")
    public ResponseEntity<List<TransportCompanyResponse>> getTransportCompanies(
            @RequestParam(required = false) String sigungu) {
        return ResponseEntity.ok(offlineService.getTransportCompanies(sigungu));
    }

    @GetMapping("/waste-facilities")
    public ResponseEntity<List<WasteFacilityResponse>> getWasteFacilities(
            @RequestParam(required = false) String sido,
            @RequestParam(required = false) String sigungu) {
        return ResponseEntity.ok(offlineService.getWasteFacilities(sido, sigungu));
    }
}
