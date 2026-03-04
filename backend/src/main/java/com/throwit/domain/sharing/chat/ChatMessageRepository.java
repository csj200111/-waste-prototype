package com.throwit.domain.sharing.chat;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByChatRoomIdOrderByCreatedAtAsc(Long chatRoomId);

    List<ChatMessage> findByChatRoomIdAndIdGreaterThanOrderByCreatedAtAsc(Long chatRoomId, Long afterId);
}
