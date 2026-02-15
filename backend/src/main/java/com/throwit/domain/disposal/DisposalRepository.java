package com.throwit.domain.disposal;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DisposalRepository extends JpaRepository<DisposalApplication, Long> {

    List<DisposalApplication> findByUserIdOrderByCreatedAtDesc(String userId);

    Optional<DisposalApplication> findByApplicationNumber(String applicationNumber);
}
