package com.throwit.domain.offline;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/offline")
@RequiredArgsConstructor
public class OfflineController {

    private final StickerShopRepository stickerShopRepository;
    private final CommunityCenterRepository communityCenterRepository;
    private final TransportCompanyRepository transportCompanyRepository;

    // GET /api/offline/sticker-shops?region={regionId}
    @GetMapping("/sticker-shops")
    public ResponseEntity<List<StickerShop>> getStickerShops(
            @RequestParam(value = "region", required = false) Long regionId) {
        // TODO: Service 레이어로 분리
        if (regionId != null) {
            return ResponseEntity.ok(stickerShopRepository.findByRegionId(regionId));
        }
        return ResponseEntity.ok(stickerShopRepository.findAll());
    }

    // GET /api/offline/centers?region={regionId}
    @GetMapping("/centers")
    public ResponseEntity<List<CommunityCenter>> getCenters(
            @RequestParam(value = "region", required = false) Long regionId) {
        // TODO: Service 레이어로 분리
        if (regionId != null) {
            return ResponseEntity.ok(communityCenterRepository.findByRegionId(regionId));
        }
        return ResponseEntity.ok(communityCenterRepository.findAll());
    }

    // GET /api/offline/transport?region={regionId}
    @GetMapping("/transport")
    public ResponseEntity<List<TransportCompany>> getTransportCompanies(
            @RequestParam(value = "region", required = false) Long regionId) {
        // TODO: Service 레이어로 분리
        if (regionId != null) {
            return ResponseEntity.ok(transportCompanyRepository.findByRegionId(regionId));
        }
        return ResponseEntity.ok(transportCompanyRepository.findAll());
    }
}
