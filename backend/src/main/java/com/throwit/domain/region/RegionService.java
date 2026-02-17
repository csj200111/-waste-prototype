package com.throwit.domain.region;

import com.throwit.domain.region.dto.RegionResponse;
import com.throwit.global.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RegionService {

    private final RegionRepository regionRepository;

    public List<RegionResponse> getAllRegions() {
        return regionRepository.findAll().stream()
                .map(RegionResponse::from)
                .collect(Collectors.toList());
    }

    public List<RegionResponse> searchRegions(String query) {
        return regionRepository.searchByQuery(query).stream()
                .map(RegionResponse::from)
                .collect(Collectors.toList());
    }

    public Region getRegionEntityById(Long id) {
        return regionRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("REGION_NOT_FOUND", "해당 지역을 찾을 수 없습니다: " + id));
    }
}
