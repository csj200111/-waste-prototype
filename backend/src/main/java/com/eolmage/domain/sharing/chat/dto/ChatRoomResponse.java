package com.eolmage.domain.sharing.chat.dto;

import com.eolmage.domain.sharing.chat.ChatRoom;
import lombok.*;

import java.time.format.DateTimeFormatter;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoomResponse {

    private Long id;
    private Long sharingPostId;
    private Long ownerId;
    private String ownerNickname;
    private Long chatterId;
    private String chatterNickname;
    private String lastMessage;
    private String lastMessageAt;
    private long messageCount;
    private long unreadCount;

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public static ChatRoomResponse from(ChatRoom room) {
        return ChatRoomResponse.builder()
                .id(room.getId())
                .sharingPostId(room.getSharingPostId())
                .ownerId(room.getOwnerId())
                .ownerNickname(room.getOwnerNickname())
                .chatterId(room.getChatterId())
                .chatterNickname(room.getChatterNickname())
                .lastMessage(room.getLastMessage())
                .lastMessageAt(room.getLastMessageAt() != null ? room.getLastMessageAt().format(FORMATTER) : null)
                .messageCount(room.getMessageCount())
                .unreadCount(room.getUnreadCount())
                .build();
    }
}
