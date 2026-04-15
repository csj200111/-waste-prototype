package com.eolmage.domain.sharing.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByChatRoomIdOrderByCreatedAtAsc(Long chatRoomId);

    List<ChatMessage> findByChatRoomIdAndIdGreaterThanOrderByCreatedAtAsc(Long chatRoomId, Long afterId);

    @Modifying
    @Transactional
    void deleteByChatRoomId(Long chatRoomId);
}
