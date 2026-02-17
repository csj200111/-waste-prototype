package com.throwit.domain.fee;

import com.throwit.domain.fee.dto.FeeResponse;
import com.throwit.global.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FeeService {

    private static final Long DEFAULT_REGION_ID = 1L; // 강남구 (fallback)

    private final FeeRepository feeRepository;

    public FeeResponse calculateFee(Long regionId, Long wasteItemId, Long sizeId) {
        // 해당 지역의 수수료 조회
        return feeRepository.findByRegionIdAndWasteItemIdAndSizeId(regionId, wasteItemId, sizeId)
                .map(FeeResponse::from)
                // fallback: 기본 지역(강남구)의 수수료로 조회
                .orElseGet(() -> {
                    if (!regionId.equals(DEFAULT_REGION_ID)) {
                        return feeRepository.findByRegionIdAndWasteItemIdAndSizeId(DEFAULT_REGION_ID, wasteItemId, sizeId)
                                .map(FeeResponse::from)
                                .orElseThrow(() -> BusinessException.notFound("FEE_NOT_AVAILABLE", "수수료 정보가 없습니다. 구청에 문의해주세요."));
                    }
                    throw BusinessException.notFound("FEE_NOT_AVAILABLE", "수수료 정보가 없습니다. 구청에 문의해주세요.");
                });
    }
}
