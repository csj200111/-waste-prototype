package com.throwit.domain.waste;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "waste_sizes")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class WasteSize {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "waste_item_id", nullable = false)
    private WasteItem wasteItem;

    @Column(nullable = false)
    private String label;

    @Column(nullable = false)
    private String description;
}
