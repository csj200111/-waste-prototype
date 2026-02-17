package com.throwit.domain.disposal;

import com.throwit.domain.region.Region;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "disposal_applications")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class DisposalApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String applicationNumber;

    @Column(nullable = false)
    private String userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "region_id", nullable = false)
    private Region region;

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<DisposalItem> items = new ArrayList<>();

    @Column(nullable = false)
    private String disposalAddress;

    @Column(nullable = false)
    private LocalDate preferredDate;

    @Column(nullable = false)
    private int totalFee;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DisposalStatus status;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void addItem(DisposalItem item) {
        items.add(item);
    }

    public void cancel() {
        if (status == DisposalStatus.COLLECTED || status == DisposalStatus.CANCELLED || status == DisposalStatus.REFUNDED) {
            throw new IllegalStateException("취소할 수 없는 상태입니다: " + status);
        }
        this.status = DisposalStatus.CANCELLED;
    }

    public void pay(PaymentMethod method) {
        if (status != DisposalStatus.PENDING_PAYMENT) {
            throw new IllegalStateException("결제할 수 없는 상태입니다: " + status);
        }
        this.paymentMethod = method;
        this.status = DisposalStatus.PAID;
    }
}
