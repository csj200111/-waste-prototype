package com.eolmage.domain.disposal;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface DisposalRepository extends JpaRepository<DisposalApplication, Long> {

    List<DisposalApplication> findByUserIdOrderByCreatedAtDesc(String userId);

    Optional<DisposalApplication> findByApplicationNumber(String applicationNumber);

    @Query("SELECT COALESCE(MAX(d.id), 0) FROM DisposalApplication d")
    long findMaxId();
}
