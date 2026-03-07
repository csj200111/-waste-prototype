package com.throwit.domain.sharing.chat;

import com.throwit.domain.sharing.chat.dto.ChatMessageRequest;
import com.throwit.domain.sharing.chat.dto.ChatMessageResponse;
import com.throwit.domain.sharing.chat.dto.ChatRoomRequest;
import com.throwit.domain.sharing.chat.dto.ChatRoomResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sharing/{postId}/chat")
@RequiredArgsConstructor
public class ChatMessageController {

    private final ChatMessageService chatMessageService;

    /**
     * 채팅방 목록 조회 (게시글 작성자용)
     */
    @GetMapping("/rooms")
    public ResponseEntity<List<ChatRoomResponse>> getRooms(@PathVariable Long postId) {
        return ResponseEntity.ok(chatMessageService.getRooms(postId));
    }

    /**
     * 채팅방 생성 또는 기존 채팅방 반환
     */
    @PostMapping("/rooms")
    public ResponseEntity<ChatRoomResponse> getOrCreateRoom(
            @PathVariable Long postId,
            @Valid @RequestBody ChatRoomRequest request) {
        return ResponseEntity.ok(chatMessageService.getOrCreateRoom(postId, request));
    }

    /**
     * 채팅방 메시지 조회 (afterId가 있으면 해당 ID 이후 메시지만 반환)
     */
    @GetMapping("/rooms/{roomId}/messages")
    public ResponseEntity<List<ChatMessageResponse>> getMessages(
            @PathVariable Long postId,
            @PathVariable Long roomId,
            @RequestParam(required = false) Long afterId) {
        if (afterId != null) {
            return ResponseEntity.ok(chatMessageService.getMessagesAfter(roomId, afterId));
        }
        return ResponseEntity.ok(chatMessageService.getMessages(roomId));
    }

    /**
     * 메시지 전송
     */
    @PostMapping("/rooms/{roomId}/messages")
    public ResponseEntity<ChatMessageResponse> send(
            @PathVariable Long postId,
            @PathVariable Long roomId,
            @Valid @RequestBody ChatMessageRequest request) {
        return ResponseEntity.ok(chatMessageService.send(roomId, request));
    }

    /**
     * 채팅방 읽음 처리
     */
    @PatchMapping("/rooms/{roomId}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long postId,
            @PathVariable Long roomId) {
        chatMessageService.markAsRead(roomId);
        return ResponseEntity.noContent().build();
    }
}
