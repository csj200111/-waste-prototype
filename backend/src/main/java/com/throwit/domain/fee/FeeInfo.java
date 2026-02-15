package com.throwit.domain.fee;

import com.throwit.domain.region.Region;
import com.throwit.domain.waste.WasteItem;
import com.throwit.domain.waste.WasteSize;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "fees")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class FeeInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "region_id", nullable = false)
    private Region region;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "waste_item_id", nullable = false)
    private WasteItem wasteItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "size_id", nullable = false)
    private WasteSize size;

    @Column(nullable = false)
    private int fee;
}
