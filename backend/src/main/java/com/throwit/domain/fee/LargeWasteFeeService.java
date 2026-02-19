package com.throwit.domain.fee;

import com.throwit.domain.fee.dto.FeeInfoDto;
import com.throwit.domain.fee.dto.WasteItemResult;
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

    public List<WasteItemResult> searchWasteItems(String sigungu, String category, String keyword) {
        List<Object[]> rows = repository.findWasteItems(sigungu, category, keyword);
        return rows.stream()
                .map(row -> new WasteItemResult((String) row[0], (String) row[1]))
                .collect(Collectors.toList());
    }

    private static final String[] SIZE_LABELS = {"소형", "중형", "대형", "특대형"};

    public List<FeeInfoDto> getFees(String sido, String sigungu, String wasteName) {
        List<FeeInfoDto> fees = repository.findBySidoAndSigunguAndWasteName(sido, sigungu, wasteName).stream()
                .map(FeeInfoDto::from)
                .sorted(Comparator.comparingInt(FeeInfoDto::getFee))
                .collect(Collectors.toList());

        // 규격이 NULL인 항목이 여러 개면 수수료 순서대로 자동 라벨 부여
        List<FeeInfoDto> nullStandards = fees.stream()
                .filter(f -> f.getWasteStandard() == null || f.getWasteStandard().isBlank())
                .collect(Collectors.toList());

        if (nullStandards.size() > 1) {
            for (int i = 0; i < nullStandards.size(); i++) {
                String label = i < SIZE_LABELS.length ? SIZE_LABELS[i] : "규격 " + (i + 1);
                nullStandards.get(i).setWasteStandard(label);
            }
        }

        return fees;
    }
}
