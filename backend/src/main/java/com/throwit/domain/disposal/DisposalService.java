package com.throwit.domain.disposal;

import com.throwit.domain.disposal.dto.DisposalCreateRequest;
import com.throwit.domain.disposal.dto.DisposalItemRequest;
import com.throwit.domain.disposal.dto.DisposalResponse;
import com.throwit.domain.disposal.dto.PaymentRequest;
import com.throwit.domain.region.Region;
import com.throwit.domain.region.RegionService;
import com.throwit.global.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DisposalService {

    private final DisposalRepository disposalRepository;
    private final RegionService regionService;

    @Transactional
    public DisposalResponse createApplication(DisposalCreateRequest request, String userId) {
        Region region = regionService.getRegionEntityById(request.getRegionId());

        // 배출 희망일 검증: 과거 날짜 불가
        if (request.getPreferredDate().isBefore(LocalDate.now())) {
            throw BusinessException.badRequest("INVALID_DATE", "배출 가능한 날짜를 선택해주세요.");
        }

        // 총 수수료 계산
        int totalFee = request.getItems().stream()
                .mapToInt(item -> item.getFee() * item.getQuantity())
                .sum();

        // 배출번호 생성: {구 약칭}-{날짜}-{5자리 시퀀스}
        String applicationNumber = generateApplicationNumber(region);

        DisposalApplication application = DisposalApplication.builder()
                .applicationNumber(applicationNumber)
                .userId(userId)
                .region(region)
                .disposalAddress(request.getDisposalAddress())
                .preferredDate(request.getPreferredDate())
                .totalFee(totalFee)
                .status(DisposalStatus.PENDING_PAYMENT)
                .build();

        // 품목 추가
        for (DisposalItemRequest itemReq : request.getItems()) {
            DisposalItem item = DisposalItem.builder()
                    .application(application)
                    .wasteItemName(itemReq.getWasteItemName())
                    .sizeLabel(itemReq.getSizeLabel())
                    .quantity(itemReq.getQuantity())
                    .fee(itemReq.getFee())
                    .photoUrl(itemReq.getPhotoUrl())
                    .build();
            application.addItem(item);
        }

        DisposalApplication saved = disposalRepository.save(application);
        return DisposalResponse.from(saved);
    }

    public DisposalResponse getApplication(Long id) {
        DisposalApplication app = findById(id);
        return DisposalResponse.from(app);
    }

    public List<DisposalResponse> getMyApplications(String userId) {
        return disposalRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(DisposalResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public DisposalResponse cancelApplication(Long id) {
        DisposalApplication app = findById(id);
        app.cancel();
        return DisposalResponse.from(app);
    }

    @Transactional
    public DisposalResponse processPayment(Long id, PaymentRequest request) {
        DisposalApplication app = findById(id);
        PaymentMethod method = PaymentMethod.valueOf(request.getPaymentMethod().toUpperCase());
        app.pay(method);
        return DisposalResponse.from(app);
    }

    private DisposalApplication findById(Long id) {
        return disposalRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("DISPOSAL_NOT_FOUND", "해당 배출 신청을 찾을 수 없습니다: " + id));
    }

    private String generateApplicationNumber(Region region) {
        String prefix = region.getDistrict().length() >= 2
                ? region.getDistrict().substring(0, 2).toUpperCase()
                : region.getDistrict().toUpperCase();
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = disposalRepository.count() + 1;
        return String.format("%s-%s-%05d", prefix, datePart, count);
    }
}
