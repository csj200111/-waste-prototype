package com.throwit.domain.offline;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransportCompanyRepository extends JpaRepository<TransportCompany, Long> {

    List<TransportCompany> findByRegionId(Long regionId);
}
