package com.throwit.domain.waste;

import com.throwit.domain.waste.dto.WasteCategoryResponse;
import com.throwit.domain.waste.dto.WasteItemResponse;
import com.throwit.global.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WasteService {

    private final WasteCategoryRepository categoryRepository;
    private final WasteItemRepository itemRepository;

    public List<WasteCategoryResponse> getCategoryTree() {
        return categoryRepository.findByParentIsNull().stream()
                .map(WasteCategoryResponse::from)
                .collect(Collectors.toList());
    }

    public List<WasteItemResponse> searchItems(String keyword) {
        List<WasteItem> items;
        if (keyword == null || keyword.isBlank()) {
            items = itemRepository.findAll();
        } else {
            items = itemRepository.findByNameContainingIgnoreCase(keyword);
        }
        return items.stream()
                .map(WasteItemResponse::from)
                .collect(Collectors.toList());
    }

    public WasteItemResponse getItemById(Long id) {
        WasteItem item = itemRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("WASTE_ITEM_NOT_FOUND", "해당 폐기물 항목을 찾을 수 없습니다: " + id));
        return WasteItemResponse.from(item);
    }

    public WasteCategory getCategoryEntityById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("CATEGORY_NOT_FOUND", "해당 카테고리를 찾을 수 없습니다: " + id));
    }
}
