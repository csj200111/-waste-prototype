package com.throwit.domain.disposal;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DisposalDataInitializer implements CommandLineRunner {

    private final DisposalRepository disposalRepository;

    @Override
    public void run(String... args) {
        // 각 userId별로 seed 데이터가 있는지 확인하고, 없으면 추가
        List<String> userIds = List.of("1", "2", "3");

        for (String userId : userIds) {
            List<DisposalApplication> existing = disposalRepository.findByUserIdOrderByCreatedAtDesc(userId);
            boolean hasPending = existing.stream().anyMatch(a ->
                    a.getStatus() == DisposalStatus.PENDING_PAYMENT || a.getStatus() == DisposalStatus.SCHEDULED);
            boolean hasCancelled = existing.stream().anyMatch(a ->
                    a.getStatus() == DisposalStatus.CANCELLED || a.getStatus() == DisposalStatus.REFUNDED);
            boolean hasCollected = existing.stream().anyMatch(a ->
                    a.getStatus() == DisposalStatus.COLLECTED);

            if (hasPending && hasCancelled && hasCollected) {
                log.info("userId={} 배출 내역 seed 데이터가 충분합니다. 스킵합니다.", userId);
                continue;
            }

            log.info("userId={} 배출 내역 seed 데이터를 삽입합니다...", userId);
            List<DisposalApplication> toSave = buildSeedData(userId, hasPending, hasCancelled, hasCollected);
            disposalRepository.saveAll(toSave);
            log.info("userId={} 배출 내역 seed 데이터 {}건 삽입 완료", userId, toSave.size());
        }
    }

    private List<DisposalApplication> buildSeedData(String userId, boolean hasPending, boolean hasCancelled, boolean hasCollected) {
        LocalDateTime now = LocalDateTime.now();
        long baseNum = disposalRepository.count() * 10;
        List<DisposalApplication> list = new ArrayList<>();

        if (!hasPending) {
            // 진행중: 결제대기
            DisposalApplication a1 = DisposalApplication.builder()
                    .applicationNumber("서-" + LocalDate.now().toString().replace("-", "") + "-" + String.format("%05d", baseNum + 1))
                    .userId(userId)
                    .sido("서울특별시")
                    .sigungu("강남구")
                    .disposalAddress("서울특별시 강남구 역삼동 123-4")
                    .preferredDate(LocalDate.now().plusDays(3))
                    .totalFee(15000)
                    .status(DisposalStatus.PENDING_PAYMENT)
                    .createdAt(now.minusDays(1))
                    .updatedAt(now.minusDays(1))
                    .build();
            addItem(a1, "소파(1인용)", "1인용", 1, 8000);
            addItem(a1, "책상", "보통", 1, 7000);
            list.add(a1);

            // 진행중: 수거예정
            DisposalApplication a2 = DisposalApplication.builder()
                    .applicationNumber("서-" + LocalDate.now().toString().replace("-", "") + "-" + String.format("%05d", baseNum + 2))
                    .userId(userId)
                    .sido("서울특별시")
                    .sigungu("강남구")
                    .disposalAddress("서울특별시 강남구 대치동 456-7")
                    .preferredDate(LocalDate.now().plusDays(5))
                    .totalFee(12000)
                    .status(DisposalStatus.SCHEDULED)
                    .paymentMethod(PaymentMethod.CARD)
                    .createdAt(now.minusDays(3))
                    .updatedAt(now.minusDays(2))
                    .build();
            addItem(a2, "냉장고(소형)", "200L 미만", 1, 12000);
            list.add(a2);

            // 진행중: 결제대기
            DisposalApplication a3 = DisposalApplication.builder()
                    .applicationNumber("서-" + LocalDate.now().toString().replace("-", "") + "-" + String.format("%05d", baseNum + 3))
                    .userId(userId)
                    .sido("경기도")
                    .sigungu("시흥시")
                    .disposalAddress("경기도 시흥시 연성동 789-1")
                    .preferredDate(LocalDate.now().plusDays(7))
                    .totalFee(5000)
                    .status(DisposalStatus.PENDING_PAYMENT)
                    .createdAt(now.minusHours(6))
                    .updatedAt(now.minusHours(6))
                    .build();
            addItem(a3, "의자", "보통", 1, 5000);
            list.add(a3);
        }

        if (!hasCollected) {
            // 완료: 수거완료
            DisposalApplication a4 = DisposalApplication.builder()
                    .applicationNumber("서-" + LocalDate.now().minusDays(20).toString().replace("-", "") + "-" + String.format("%05d", baseNum + 4))
                    .userId(userId)
                    .sido("서울특별시")
                    .sigungu("강남구")
                    .disposalAddress("서울특별시 강남구 서초동 321-6")
                    .preferredDate(LocalDate.now().minusDays(20))
                    .totalFee(8000)
                    .status(DisposalStatus.COLLECTED)
                    .paymentMethod(PaymentMethod.TRANSFER)
                    .createdAt(now.minusDays(25))
                    .updatedAt(now.minusDays(20))
                    .build();
            addItem(a4, "침대(싱글)", "싱글", 1, 8000);
            list.add(a4);

            // 완료: 수거완료
            DisposalApplication a5 = DisposalApplication.builder()
                    .applicationNumber("서-" + LocalDate.now().minusDays(15).toString().replace("-", "") + "-" + String.format("%05d", baseNum + 5))
                    .userId(userId)
                    .sido("서울특별시")
                    .sigungu("강남구")
                    .disposalAddress("서울특별시 강남구 청담동 100-3")
                    .preferredDate(LocalDate.now().minusDays(15))
                    .totalFee(6000)
                    .status(DisposalStatus.COLLECTED)
                    .paymentMethod(PaymentMethod.CARD)
                    .createdAt(now.minusDays(18))
                    .updatedAt(now.minusDays(15))
                    .build();
            addItem(a5, "자전거", "보통", 1, 6000);
            list.add(a5);

            // 완료: 수거완료
            DisposalApplication a6 = DisposalApplication.builder()
                    .applicationNumber("서-" + LocalDate.now().minusDays(10).toString().replace("-", "") + "-" + String.format("%05d", baseNum + 6))
                    .userId(userId)
                    .sido("경기도")
                    .sigungu("시흥시")
                    .disposalAddress("경기도 시흥시 신천동 555-2")
                    .preferredDate(LocalDate.now().minusDays(10))
                    .totalFee(20000)
                    .status(DisposalStatus.COLLECTED)
                    .paymentMethod(PaymentMethod.CARD)
                    .createdAt(now.minusDays(12))
                    .updatedAt(now.minusDays(10))
                    .build();
            addItem(a6, "세탁기(일반)", "보통", 1, 12000);
            addItem(a6, "전자레인지", "보통", 1, 8000);
            list.add(a6);
        }

        if (!hasCancelled) {
            // 취소: cancelled
            DisposalApplication a7 = DisposalApplication.builder()
                    .applicationNumber("서-" + LocalDate.now().minusDays(5).toString().replace("-", "") + "-" + String.format("%05d", baseNum + 7))
                    .userId(userId)
                    .sido("서울특별시")
                    .sigungu("강남구")
                    .disposalAddress("서울특별시 강남구 삼성동 200-5")
                    .preferredDate(LocalDate.now().minusDays(5))
                    .totalFee(10000)
                    .status(DisposalStatus.CANCELLED)
                    .createdAt(now.minusDays(7))
                    .updatedAt(now.minusDays(5))
                    .build();
            addItem(a7, "옷장(소형)", "소형", 1, 10000);
            list.add(a7);

            // 취소: refunded
            DisposalApplication a8 = DisposalApplication.builder()
                    .applicationNumber("서-" + LocalDate.now().minusDays(12).toString().replace("-", "") + "-" + String.format("%05d", baseNum + 8))
                    .userId(userId)
                    .sido("서울특별시")
                    .sigungu("강남구")
                    .disposalAddress("서울특별시 강남구 논현동 50-8")
                    .preferredDate(LocalDate.now().minusDays(12))
                    .totalFee(16000)
                    .status(DisposalStatus.REFUNDED)
                    .paymentMethod(PaymentMethod.CARD)
                    .createdAt(now.minusDays(15))
                    .updatedAt(now.minusDays(12))
                    .build();
            addItem(a8, "TV(대형)", "40인치 이상", 1, 10000);
            addItem(a8, "에어컨(벽걸이)", "벽걸이", 1, 6000);
            list.add(a8);

            // 취소: cancelled
            DisposalApplication a9 = DisposalApplication.builder()
                    .applicationNumber("서-" + LocalDate.now().minusDays(2).toString().replace("-", "") + "-" + String.format("%05d", baseNum + 9))
                    .userId(userId)
                    .sido("경기도")
                    .sigungu("시흥시")
                    .disposalAddress("경기도 시흥시 장곡동 77-3")
                    .preferredDate(LocalDate.now().plusDays(1))
                    .totalFee(3000)
                    .status(DisposalStatus.CANCELLED)
                    .createdAt(now.minusDays(2))
                    .updatedAt(now.minusDays(1))
                    .build();
            addItem(a9, "선풍기", "보통", 1, 3000);
            list.add(a9);
        }

        return list;
    }

    private void addItem(DisposalApplication app, String name, String sizeLabel, int quantity, int fee) {
        DisposalItem item = DisposalItem.builder()
                .application(app)
                .wasteItemName(name)
                .sizeLabel(sizeLabel)
                .quantity(quantity)
                .fee(fee)
                .build();
        app.addItem(item);
    }
}
