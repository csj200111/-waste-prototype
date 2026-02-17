package com.throwit.domain.recycle;

import com.throwit.domain.recycle.dto.RecycleCreateRequest;
import com.throwit.domain.recycle.dto.RecycleItemResponse;
import com.throwit.domain.region.Region;
import com.throwit.domain.region.RegionService;
import com.throwit.domain.waste.WasteCategory;
import com.throwit.domain.waste.WasteService;
import com.throwit.global.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RecycleService {

    private final RecycleRepository recycleRepository;
    private final RegionService regionService;
    private final WasteService wasteService;

    public List<RecycleItemResponse> getItems(Long regionId) {
        List<RecycleItem> items = regionId != null
                ? recycleRepository.findByRegionIdOrderByCreatedAtDesc(regionId)
                : recycleRepository.findAllByOrderByCreatedAtDesc();
        return items.stream()
                .map(RecycleItemResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public RecycleItemResponse registerItem(RecycleCreateRequest request, String userId) {
        Region region = regionService.getRegionEntityById(request.getRegionId());
        WasteCategory category = wasteService.getCategoryEntityById(request.getCategoryId());

        // photos 리스트를 JSON 문자열로 변환
        String photosJson = "[]";
        if (request.getPhotos() != null && !request.getPhotos().isEmpty()) {
            photosJson = "[" + request.getPhotos().stream()
                    .map(p -> "\"" + p + "\"")
                    .collect(Collectors.joining(",")) + "]";
        }

        RecycleItem item = RecycleItem.builder()
                .userId(userId)
                .title(request.getTitle())
                .description(request.getDescription())
                .photos(photosJson)
                .category(category)
                .region(region)
                .address(request.getAddress())
                .lat(request.getLat())
                .lng(request.getLng())
                .status(RecycleStatus.AVAILABLE)
                .build();

        RecycleItem saved = recycleRepository.save(item);
        return RecycleItemResponse.from(saved);
    }

    @Transactional
    public RecycleItemResponse updateStatus(Long id, String status) {
        RecycleItem item = recycleRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("RECYCLE_ITEM_NOT_FOUND", "해당 역경매 물품을 찾을 수 없습니다: " + id));

        RecycleStatus newStatus = RecycleStatus.valueOf(status.toUpperCase());
        item.changeStatus(newStatus);
        return RecycleItemResponse.from(item);
    }
}
