package com.throwit.domain.offline;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommunityCenterRepository extends JpaRepository<CommunityCenter, Long> {

    List<CommunityCenter> findByRegionId(Long regionId);
}
