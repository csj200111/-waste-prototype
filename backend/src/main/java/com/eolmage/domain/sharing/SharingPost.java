package com.eolmage.domain.sharing;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "sharing_posts")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class SharingPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private SharingStatus status = SharingStatus.SHARING;

    @Column(nullable = false)
    private String sido;

    @Column(nullable = false)
    private String sigungu;

    private String dong;

    private String preferredPlace;

    private Double latitude;

    private Double longitude;

    @Column(columnDefinition = "LONGTEXT")
    private String imageUrls;

    private Long authorId;

    @Column(nullable = false)
    private String authorNickname;

    private Long receiverId;

    @Builder.Default
    private int viewCount = 0;

    @Builder.Default
    private int chatCount = 0;

    @Builder.Default
    private int scrapCount = 0;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void incrementViewCount() {
        this.viewCount++;
    }

    public void incrementScrapCount() {
        this.scrapCount++;
    }

    public void decrementScrapCount() {
        if (this.scrapCount > 0) {
            this.scrapCount--;
        }
    }

    public void completeTransaction(Long receiverId) {
        this.status = SharingStatus.COMPLETED;
        this.receiverId = receiverId;
    }

    public void cancelTransaction() {
        this.status = SharingStatus.SHARING;
        this.receiverId = null;
    }

    public void update(String title, String description, String category,
                       String preferredPlace, String imageUrls, SharingStatus status) {
        this.title = title;
        this.description = description;
        this.category = category;
        this.preferredPlace = preferredPlace;
        this.imageUrls = imageUrls;
        if (status != null) {
            this.status = status;
        }
    }
}
