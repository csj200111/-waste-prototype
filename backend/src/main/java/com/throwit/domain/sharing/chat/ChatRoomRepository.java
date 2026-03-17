package com.throwit.domain.sharing.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {

    Optional<ChatRoom> findBySharingPostIdAndChatterId(Long sharingPostId, Long chatterId);

    List<ChatRoom> findBySharingPostIdOrderByLastMessageAtDesc(Long sharingPostId);

    List<ChatRoom> findByChatterIdOrderByLastMessageAtDesc(Long chatterId);

    @Modifying
    @Transactional
    @Query("UPDATE ChatRoom r SET r.ownerNickname = :nickname WHERE r.ownerId = :userId")
    void updateOwnerNicknameByOwnerId(@Param("userId") Long userId, @Param("nickname") String nickname);

    @Modifying
    @Transactional
    @Query("UPDATE ChatRoom r SET r.chatterNickname = :nickname WHERE r.chatterId = :userId")
    void updateChatterNicknameByChatterId(@Param("userId") Long userId, @Param("nickname") String nickname);

    List<ChatRoom> findBySharingPostId(Long sharingPostId);
}
