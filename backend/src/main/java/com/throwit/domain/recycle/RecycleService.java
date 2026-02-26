package com.throwit.domain.recycle;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.throwit.domain.recycle.dto.RecycleCreateRequest;
import com.throwit.domain.recycle.dto.RecycleItemResponse;
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
    public RecycleItemResponse updateStatus(Long id, String status) {
        RecycleItem item = recycleRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("RECYCLE_ITEM_NOT_FOUND", "해당 역경매 물품을 찾을 수 없습니다: " + id));
        RecycleStatus newStatus = RecycleStatus.valueOf(status.toUpperCase());
        item.changeStatus(newStatus);
        return RecycleItemResponse.from(item);
    }

    @Transactional
    public void deleteItem(Long id) {
        RecycleItem item = recycleRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("RECYCLE_ITEM_NOT_FOUND", "해당 역경매 물품을 찾을 수 없습니다: " + id));
        recycleRepository.delete(item);
    }
}
