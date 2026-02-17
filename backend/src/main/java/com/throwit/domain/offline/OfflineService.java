package com.throwit.domain.offline;

import com.throwit.domain.offline.dto.CommunityCenterResponse;
import com.throwit.domain.offline.dto.StickerShopResponse;
import com.throwit.domain.offline.dto.TransportCompanyResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OfflineService {

    private final StickerShopRepository stickerShopRepository;
    private final CommunityCenterRepository communityCenterRepository;
    private final TransportCompanyRepository transportCompanyRepository;

    public List<StickerShopResponse> getStickerShops(Long regionId) {
        List<StickerShop> shops = regionId != null
                ? stickerShopRepository.findByRegionId(regionId)
                : stickerShopRepository.findAll();
        return shops.stream()
                .map(StickerShopResponse::from)
                .collect(Collectors.toList());
    }

    public List<CommunityCenterResponse> getCenters(Long regionId) {
        List<CommunityCenter> centers = regionId != null
                ? communityCenterRepository.findByRegionId(regionId)
                : communityCenterRepository.findAll();
        return centers.stream()
                .map(CommunityCenterResponse::from)
                .collect(Collectors.toList());
    }

    public List<TransportCompanyResponse> getTransportCompanies(Long regionId) {
        List<TransportCompany> companies = regionId != null
                ? transportCompanyRepository.findByRegionId(regionId)
                : transportCompanyRepository.findAll();
        return companies.stream()
                .map(TransportCompanyResponse::from)
                .collect(Collectors.toList());
    }
}
