package com.throwit.domain.sharing;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface SharingPostRepository extends JpaRepository<SharingPost, Long> {

    List<SharingPost> findBySigunguOrderByCreatedAtDesc(String sigungu);

    List<SharingPost> findAllByOrderByCreatedAtDesc();

    List<SharingPost> findBySigunguAndTitleContainingOrderByCreatedAtDesc(String sigungu, String keyword);

    List<SharingPost> findByAuthorIdOrderByCreatedAtDesc(Long authorId);

    @Modifying
    @Transactional
    @Query("UPDATE SharingPost p SET p.authorNickname = :nickname WHERE p.authorId = :authorId")
    void updateAuthorNicknameByAuthorId(@Param("authorId") Long authorId, @Param("nickname") String nickname);

    List<SharingPost> findByReceiverIdOrderByCreatedAtDesc(Long receiverId);
}
