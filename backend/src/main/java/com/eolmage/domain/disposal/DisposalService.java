package com.eolmage.domain.disposal;

import com.eolmage.domain.disposal.dto.DisposalCreateRequest;
import com.eolmage.domain.disposal.dto.DisposalItemRequest;
import com.eolmage.domain.disposal.dto.DisposalResponse;
import com.eolmage.domain.disposal.dto.PaymentRequest;
import com.eolmage.global.exception.BusinessException;
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

    @Transactional
    public DisposalResponse createApplication(DisposalCreateRequest request, String userId) {
        if (request.getPreferredDate().isBefore(LocalDate.now())) {
            throw BusinessException.badRequest("INVALID_DATE", "배출 가능한 날짜를 선택해주세요.");
        }

        int totalFee = request.getItems().stream()
                .mapToInt(item -> item.getFee() * item.getQuantity())
                .sum();

        String applicationNumber = generateApplicationNumber(request.getSigungu());

        DisposalApplication application = DisposalApplication.builder()
                .applicationNumber(applicationNumber)
                .userId(userId)
                .sido(request.getSido())
                .sigungu(request.getSigungu())
                .disposalAddress(request.getDisposalAddress())
                .preferredDate(request.getPreferredDate())
                .totalFee(totalFee)
                .status(DisposalStatus.PENDING_PAYMENT)
                .build();

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
        return DisposalResponse.from(findById(id));
    }

    public List<DisposalResponse> getMyApplications(String userId) {
        return disposalRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(DisposalResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public DisposalResponse cancelApplication(Long id, String userId) {
        DisposalApplication app = findById(id);
        if (!app.getUserId().equals(userId)) {
            throw BusinessException.badRequest("NOT_OWNER", "본인의 배출 신청만 취소할 수 있습니다.");
        }
        app.cancel();
        return DisposalResponse.from(app);
    }

    @Transactional
    public DisposalResponse processPayment(Long id, String userId, PaymentRequest request) {
        DisposalApplication app = findById(id);
        if (!app.getUserId().equals(userId)) {
            throw BusinessException.badRequest("NOT_OWNER", "본인의 배출 신청만 결제할 수 있습니다.");
        }
        PaymentMethod method;
        try {
            method = PaymentMethod.valueOf(request.getPaymentMethod().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw BusinessException.badRequest("INVALID_PAYMENT_METHOD", "올바르지 않은 결제 방법입니다: " + request.getPaymentMethod());
        }
        app.pay(method);
        return DisposalResponse.from(app);
    }

    @Transactional
    public void deleteApplication(Long id, String userId) {
        DisposalApplication app = findById(id);
        if (!app.getUserId().equals(userId)) {
            throw BusinessException.badRequest("NOT_OWNER", "본인의 배출 신청만 삭제할 수 있습니다.");
        }
        disposalRepository.delete(app);
    }

    private DisposalApplication findById(Long id) {
        return disposalRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("DISPOSAL_NOT_FOUND", "해당 배출 신청을 찾을 수 없습니다: " + id));
    }

    private String generateApplicationNumber(String sigungu) {
        String prefix = sigungu.length() >= 2
                ? sigungu.substring(0, 2)
                : sigungu;
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = disposalRepository.findMaxId() + 1;
        return String.format("%s-%s-%05d", prefix, datePart, count);
    }
}
