package com.eolmage.domain.sharing;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ScrapRepository extends JpaRepository<Scrap, Long> {

    Optional<Scrap> findByUserIdAndSharingPost(String userId, SharingPost sharingPost);

    List<Scrap> findByUserIdOrderByCreatedAtDesc(String userId);

    boolean existsByUserIdAndSharingPost(String userId, SharingPost sharingPost);

    void deleteBySharingPost(SharingPost sharingPost);

    void deleteByUserId(String userId);
}
