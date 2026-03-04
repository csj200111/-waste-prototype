package com.throwit.domain.sharing;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SharingPostRepository extends JpaRepository<SharingPost, Long> {

    List<SharingPost> findBySigunguOrderByCreatedAtDesc(String sigungu);

    List<SharingPost> findAllByOrderByCreatedAtDesc();

    List<SharingPost> findBySigunguAndTitleContainingOrderByCreatedAtDesc(String sigungu, String keyword);

    List<SharingPost> findByAuthorIdOrderByCreatedAtDesc(Long authorId);

    List<SharingPost> findByAuthorIdOrAuthorNicknameOrderByCreatedAtDesc(Long authorId, String authorNickname);
}
