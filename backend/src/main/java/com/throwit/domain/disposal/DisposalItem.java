package com.throwit.domain.disposal;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "disposal_items")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class DisposalItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private DisposalApplication application;

    @Column(nullable = false)
    private String wasteItemName;

    @Column(nullable = false)
    private String sizeLabel;

    @Column(nullable = false)
    private int quantity;

    @Column(nullable = false)
    private int fee;

    private String photoUrl;
}
