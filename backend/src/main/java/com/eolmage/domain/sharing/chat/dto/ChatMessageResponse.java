package com.eolmage.domain.sharing.chat.dto;

import com.eolmage.domain.sharing.chat.ChatMessage;
import lombok.*;

import java.time.format.DateTimeFormatter;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageResponse {

    private Long id;
    private Long chatRoomId;
    private Long senderId;
    private String senderNickname;
    private String content;
    private String createdAt;

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public static ChatMessageResponse from(ChatMessage msg) {
        return ChatMessageResponse.builder()
                .id(msg.getId())
                .chatRoomId(msg.getChatRoomId())
                .senderId(msg.getSenderId())
                .senderNickname(msg.getSenderNickname())
                .content(msg.getContent())
                .createdAt(msg.getCreatedAt().format(FORMATTER))
                .build();
    }
}
