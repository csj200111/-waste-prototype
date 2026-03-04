package com.throwit.domain.sharing.chat;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {

    Optional<ChatRoom> findBySharingPostIdAndChatterId(Long sharingPostId, Long chatterId);

    List<ChatRoom> findBySharingPostIdOrderByLastMessageAtDesc(Long sharingPostId);
}
