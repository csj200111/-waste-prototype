package com.eolmage.domain.recycle;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.eolmage.domain.recycle.dto.RecycleCreateRequest;
import com.eolmage.domain.recycle.dto.RecycleItemResponse;
import com.eolmage.global.exception.BusinessException;
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
    private final ObjectMapper objectMapper;

    public List<RecycleItemResponse> getItems(String sigungu) {
        List<RecycleItem> items = sigungu != null
                ? recycleRepository.findBySigunguOrderByCreatedAtDesc(sigungu)
                : recycleRepository.findAllByOrderByCreatedAtDesc();
        return items.stream()
                .map(RecycleItemResponse::from)
                .collect(Collectors.toList());
    }

    public List<RecycleItemResponse> getMyItems(String userId) {
        return recycleRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(RecycleItemResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public RecycleItemResponse registerItem(RecycleCreateRequest request, String userId) {
        String photosJson = "[]";
        if (request.getPhotos() != null && !request.getPhotos().isEmpty()) {
            try {
                photosJson = objectMapper.writeValueAsString(request.getPhotos());
            } catch (JsonProcessingException e) {
                photosJson = "[]";
            }
        }

        RecycleItem item = RecycleItem.builder()
                .userId(userId)
                .title(request.getTitle())
                .description(request.getDescription())
                .photos(photosJson)
                .sido(request.getSido())
                .sigungu(request.getSigungu())
                .address(request.getAddress())
                .lat(request.getLat())
                .lng(request.getLng())
                .status(RecycleStatus.AVAILABLE)
                .build();

        RecycleItem saved = recycleRepository.save(item);
        return RecycleItemResponse.from(saved);
    }

    @Transactional
    public RecycleItemResponse updateStatus(Long id, String status, String userId) {
        RecycleItem item = recycleRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("RECYCLE_ITEM_NOT_FOUND", "해당 재활용 물품을 찾을 수 없습니다: " + id));
        if (!item.getUserId().equals(userId)) {
            throw BusinessException.badRequest("NOT_OWNER", "본인의 물품만 상태를 변경할 수 있습니다.");
        }
        RecycleStatus newStatus;
        try {
            newStatus = RecycleStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw BusinessException.badRequest("INVALID_STATUS", "올바르지 않은 상태값입니다: " + status);
        }
        item.changeStatus(newStatus);
        return RecycleItemResponse.from(item);
    }

    @Transactional
    public void deleteItem(Long id, String userId) {
        RecycleItem item = recycleRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("RECYCLE_ITEM_NOT_FOUND", "해당 재활용 물품을 찾을 수 없습니다: " + id));
        if (!item.getUserId().equals(userId)) {
            throw BusinessException.badRequest("NOT_OWNER", "본인의 물품만 삭제할 수 있습니다.");
        }
        recycleRepository.delete(item);
    }
}
