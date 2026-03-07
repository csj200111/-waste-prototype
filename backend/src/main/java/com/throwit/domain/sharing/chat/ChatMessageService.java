package com.throwit.domain.sharing.chat;

import com.throwit.domain.notification.NotificationService;
import com.throwit.domain.sharing.SharingPost;
import com.throwit.domain.sharing.SharingPostRepository;
import com.throwit.global.exception.BusinessException;
import com.throwit.domain.sharing.chat.dto.ChatMessageRequest;
import com.throwit.domain.sharing.chat.dto.ChatMessageResponse;
import com.throwit.domain.sharing.chat.dto.ChatRoomRequest;
import com.throwit.domain.sharing.chat.dto.ChatRoomResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatMessageService {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final SharingPostRepository sharingPostRepository;
    private final NotificationService notificationService;

    /**
     * 채팅방 생성 또는 기존 채팅방 반환
     */
    @Transactional
    public ChatRoomResponse getOrCreateRoom(Long sharingPostId, ChatRoomRequest request) {
        return chatRoomRepository.findBySharingPostIdAndChatterId(sharingPostId, request.getChatterId())
                .map(ChatRoomResponse::from)
                .orElseGet(() -> {
                    SharingPost post = sharingPostRepository.findById(sharingPostId)
                            .orElseThrow(() -> BusinessException.notFound("POST_NOT_FOUND", "게시글을 찾을 수 없습니다."));

                    if (post.getAuthorId() == null) {
                        throw BusinessException.badRequest("INVALID_POST", "작성자 정보가 없는 게시글입니다.");
                    }

                    ChatRoom room = ChatRoom.builder()
                            .sharingPostId(sharingPostId)
                            .ownerId(post.getAuthorId())
                            .ownerNickname(post.getAuthorNickname())
                            .chatterId(request.getChatterId())
                            .chatterNickname(request.getChatterNickname())
                            .build();

                    return ChatRoomResponse.from(chatRoomRepository.save(room));
                });
    }

    /**
     * 게시글의 채팅방 목록 조회 (게시글 작성자용)
     */
    public List<ChatRoomResponse> getRooms(Long sharingPostId) {
        return chatRoomRepository.findBySharingPostIdOrderByLastMessageAtDesc(sharingPostId)
                .stream()
                .map(ChatRoomResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * 채팅방 메시지 조회
     */
    public List<ChatMessageResponse> getMessages(Long roomId) {
        return chatMessageRepository.findByChatRoomIdOrderByCreatedAtAsc(roomId)
                .stream()
                .map(ChatMessageResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * 특정 ID 이후의 새 메시지만 조회
     */
    public List<ChatMessageResponse> getMessagesAfter(Long roomId, Long afterId) {
        return chatMessageRepository.findByChatRoomIdAndIdGreaterThanOrderByCreatedAtAsc(roomId, afterId)
                .stream()
                .map(ChatMessageResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * 메시지 전송
     */
    @Transactional
    public ChatMessageResponse send(Long roomId, ChatMessageRequest request) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> BusinessException.notFound("CHATROOM_NOT_FOUND", "채팅방을 찾을 수 없습니다."));

        ChatMessage message = ChatMessage.builder()
                .chatRoomId(roomId)
                .senderId(request.getSenderId())
                .senderNickname(request.getSenderNickname())
                .content(request.getContent())
                .build();

        ChatMessage saved = chatMessageRepository.save(message);
        room.updateLastMessage(request.getContent(), request.getSenderId());

        // 수신자에게 알림 생성
        Long recipientId;
        if (request.getSenderId().equals(room.getOwnerId())) {
            recipientId = room.getChatterId();
        } else {
            recipientId = room.getOwnerId();
        }

        SharingPost post = sharingPostRepository.findById(room.getSharingPostId()).orElse(null);
        String postTitle = (post != null) ? post.getTitle() : "나눔 게시글";

        notificationService.create(
                recipientId,
                "CHAT",
                "새로운 채팅",
                "'" + postTitle + "' 게시글에 새 메시지가 왔어요.",
                "/sharing/" + room.getSharingPostId() + "/chat?roomId=" + room.getId()
        );

        return ChatMessageResponse.from(saved);
    }

    /**
     * 채팅방 읽음 처리
     */
    @Transactional
    public void markAsRead(Long roomId) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> BusinessException.notFound("CHATROOM_NOT_FOUND", "채팅방을 찾을 수 없습니다."));
        room.markAsRead();
    }
}
