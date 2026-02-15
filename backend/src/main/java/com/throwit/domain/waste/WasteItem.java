package com.throwit.domain.waste;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "waste_items")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class WasteItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private WasteCategory category;

    @Column(nullable = false)
    private String name;

    @OneToMany(mappedBy = "wasteItem", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<WasteSize> sizes = new ArrayList<>();
}
