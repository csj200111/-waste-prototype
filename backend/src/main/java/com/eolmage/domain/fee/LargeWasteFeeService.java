package com.eolmage.domain.fee;

import com.eolmage.domain.fee.dto.FeeInfoDto;
import com.eolmage.domain.fee.dto.WasteItemResult;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LargeWasteFeeService {

    private final LargeWasteFeeRepository repository;

    public List<String> getSido() {
        return repository.findDistinctSido();
    }

    public List<String> getSigungu(String sido) {
        return repository.findDistinctSigunguBySido(sido);
    }

    public List<String> getCategories() {
        return repository.findDistinctCategories();
    }

    public List<WasteItemResult> searchWasteItems(String sido, String sigungu, String category, String keyword) {
        boolean hasCategory = category != null && !category.isBlank();

        // 1차: 정확한 sigungu 매칭
        List<Object[]> sigunguRows = hasCategory
                ? repository.findWasteItemsWithCategory(sigungu, category, keyword)
                : repository.findWasteItemsAll(sigungu, keyword);

        // 2차 폴백: sigungu에 결과가 없을 때만 같은 sido 내 데이터로 대체
        if (sigunguRows.isEmpty() && sido != null && !sido.isBlank()) {
            List<Object[]> sidoRows = hasCategory
                    ? repository.findWasteItemsBySidoWithCategory(sido, category, keyword)
                    : repository.findWasteItemsBySidoAll(sido, keyword);

            return sidoRows.stream()
                    .map(row -> new WasteItemResult((String) row[0], (String) row[1]))
                    .collect(Collectors.toList());
        }

        return sigunguRows.stream()
                .map(row -> new WasteItemResult((String) row[0], (String) row[1]))
                .collect(Collectors.toList());
    }

    private static final String[] SIZE_LABELS = {"소형", "중형", "대형", "특대형"};

    public List<FeeInfoDto> getFees(String sido, String sigungu, String wasteName) {
        // 1차: 정확한 sido + sigungu + wasteName 매칭
        List<LargeWasteFee> entities = repository.findBySidoAndSigunguAndWasteName(sido, sigungu, wasteName);

        // 2차 폴백: 같은 sido 내 데이터가 있는 첫 번째 시군구 하나만 사용
        if (entities.isEmpty()) {
            List<LargeWasteFee> allInSido = repository.findBySidoAndWasteName(sido, wasteName);
            if (!allInSido.isEmpty()) {
                String fallbackSigungu = allInSido.get(0).getSigungu();
                entities = allInSido.stream()
                        .filter(e -> fallbackSigungu.equals(e.getSigungu()))
                        .collect(Collectors.toList());
            }
        }

        List<FeeInfoDto> fees = entities.stream()
                .map(FeeInfoDto::from)
                .sorted(Comparator.comparingInt(FeeInfoDto::getFee))
                .collect(Collectors.toList());

        // 규격 라벨 개선: wasteName 괄호에서 규격 추출
        for (FeeInfoDto fee : fees) {
            if (fee.getWasteStandard() == null || fee.getWasteStandard().isBlank()) {
                String extracted = extractStandardFromName(fee.getWasteName());
                if (extracted != null) {
                    fee.setWasteStandard(extracted);
                }
            }
        }

        // 여전히 NULL인 항목이 여러 개면 자동 라벨 부여 (최대 4개)
        List<FeeInfoDto> nullStandards = fees.stream()
                .filter(f -> f.getWasteStandard() == null || f.getWasteStandard().isBlank())
                .collect(Collectors.toList());

        if (nullStandards.size() > 1) {
            int limit = Math.min(nullStandards.size(), SIZE_LABELS.length);
            for (int i = 0; i < limit; i++) {
                nullStandards.get(i).setWasteStandard(SIZE_LABELS[i]);
            }
        }

        // 규격명 글자순 정렬
        fees.sort(Comparator.comparing(
                f -> f.getWasteStandard() != null ? f.getWasteStandard() : "",
                Comparator.naturalOrder()));

        return fees;
    }

    public List<FeeInfoDto> getFeesByWasteNameLike(String sido, String sigungu, String wasteName) {
        List<LargeWasteFee> entities = repository
                .findBySidoAndSigunguAndWasteNameContaining(sido, sigungu, wasteName);

        // 폴백: 해당 시군구에 데이터가 없으면 같은 sido 내 첫 번째 시군구 하나만 사용
        if (entities.isEmpty()) {
            List<LargeWasteFee> allInSido = repository.findBySidoAndWasteName(sido, wasteName);
            if (!allInSido.isEmpty()) {
                String fallbackSigungu = allInSido.get(0).getSigungu();
                entities = allInSido.stream()
                        .filter(e -> fallbackSigungu.equals(e.getSigungu()))
                        .collect(Collectors.toList());
            }
        }

        List<FeeInfoDto> fees = entities.stream()
                .map(FeeInfoDto::from)
                .sorted(Comparator.comparingInt(FeeInfoDto::getFee))
                .collect(Collectors.toList());

        // 규격 라벨 개선: wasteName 괄호에서 규격 추출
        for (FeeInfoDto fee : fees) {
            if (fee.getWasteStandard() == null || fee.getWasteStandard().isBlank()) {
                String extracted = extractStandardFromName(fee.getWasteName());
                if (extracted != null) {
                    fee.setWasteStandard(extracted);
                }
            }
        }

        // 여전히 NULL인 항목이 여러 개면 자동 라벨 부여 (최대 4개)
        List<FeeInfoDto> nullStandards = fees.stream()
                .filter(f -> f.getWasteStandard() == null || f.getWasteStandard().isBlank())
                .collect(Collectors.toList());

        if (nullStandards.size() > 1) {
            int limit = Math.min(nullStandards.size(), SIZE_LABELS.length);
            for (int i = 0; i < limit; i++) {
                nullStandards.get(i).setWasteStandard(SIZE_LABELS[i]);
            }
        }

        // 규격명 글자순 정렬
        fees.sort(Comparator.comparing(
                f -> f.getWasteStandard() != null ? f.getWasteStandard() : "",
                Comparator.naturalOrder()));

        return fees;
    }

    /**
     * wasteName에서 괄호 안 규격 정보를 추출한다.
     * 예: "소파(1인용)" → "1인용", "냉장고(소형)" → "소형"
     * 괄호가 없으면 null 반환
     */
    private String extractStandardFromName(String wasteName) {
        if (wasteName == null) return null;
        int open = wasteName.indexOf('(');
        int close = wasteName.indexOf(')', open + 1);
        if (open >= 0 && close > open) {
            return wasteName.substring(open + 1, close);
        }
        return null;
    }
}
