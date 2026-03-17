package com.throwit.domain.offline;

import com.throwit.domain.offline.dto.CommunityCenterResponse;
import com.throwit.domain.offline.dto.StickerShopResponse;
import com.throwit.domain.offline.dto.TransportCompanyResponse;
import com.throwit.domain.offline.dto.WasteFacilityResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OfflineService {

    private final WasteFacilityRepository wasteFacilityRepository;

    private static final List<StickerShopResponse> STICKER_SHOPS = List.of(
        new StickerShopResponse(1L, "역삼동 GS25", "서울특별시 강남구 역삼로 123", "02-1234-5678", "강남구", 37.4989, 127.0285),
        new StickerShopResponse(2L, "삼성동 CU", "서울특별시 강남구 봉은사로 45", "02-2345-6789", "강남구", 37.5145, 127.0589),
        new StickerShopResponse(3L, "서초동 세븐일레븐", "서울특별시 서초구 서초대로 78", "02-3456-7890", "서초구", 37.4836, 127.0327)
    );

    private static final List<CommunityCenterResponse> COMMUNITY_CENTERS = List.of(
        new CommunityCenterResponse(1L, "역삼1동 주민센터", "서울특별시 강남구 역삼로 17길 10", "02-3423-5700", "강남구", 37.4995, 127.0315),
        new CommunityCenterResponse(2L, "삼성1동 주민센터", "서울특별시 강남구 선릉로 654", "02-3423-6900", "강남구", 37.5082, 127.0487),
        new CommunityCenterResponse(3L, "서초1동 주민센터", "서울특별시 서초구 서초중앙로 10", "02-2155-6800", "서초구", 37.4899, 127.0155)
    );

    private static final List<TransportCompanyResponse> TRANSPORT_COMPANIES = List.of(
        new TransportCompanyResponse(1L, "서울대형폐기물수거", "010-1234-5678", "강남구", "강남구 전 지역 운반 대행"),
        new TransportCompanyResponse(2L, "행복운반서비스", "010-2345-6789", "강남구", "24시간 운반 대행, 층계 운반 추가요금"),
        new TransportCompanyResponse(3L, "클린서울운반", "010-3456-7890", "서초구", "서초·강남 전문 운반 업체")
    );

    public List<StickerShopResponse> getStickerShops(String sigungu) {
        if (sigungu == null || sigungu.isBlank()) return STICKER_SHOPS;
        return STICKER_SHOPS.stream()
                .filter(s -> sigungu.equals(s.getSigungu()))
                .collect(Collectors.toList());
    }

    public List<CommunityCenterResponse> getCenters(String sigungu) {
        if (sigungu == null || sigungu.isBlank()) return COMMUNITY_CENTERS;
        return COMMUNITY_CENTERS.stream()
                .filter(c -> sigungu.equals(c.getSigungu()))
                .collect(Collectors.toList());
    }

    public List<TransportCompanyResponse> getTransportCompanies(String sigungu) {
        if (sigungu == null || sigungu.isBlank()) return TRANSPORT_COMPANIES;
        return TRANSPORT_COMPANIES.stream()
                .filter(t -> sigungu.equals(t.getSigungu()))
                .collect(Collectors.toList());
    }

    public List<WasteFacilityResponse> getWasteFacilities(String sido, String sigungu) {
        List<WasteFacility> facilities;
        if (sido != null && !sido.isBlank() && sigungu != null && !sigungu.isBlank()) {
            facilities = wasteFacilityRepository.findBySidoAndSigungu(sido, sigungu);
        } else if (sido != null && !sido.isBlank()) {
            facilities = wasteFacilityRepository.findBySido(sido);
        } else {
            return List.of();
        }
        return facilities.stream()
                .map(WasteFacilityResponse::from)
                .collect(Collectors.toList());
    }
}
