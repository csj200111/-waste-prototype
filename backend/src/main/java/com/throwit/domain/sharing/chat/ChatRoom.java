package com.throwit.domain.sharing.chat;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_rooms", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"sharingPostId", "chatterId"})
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ChatRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long sharingPostId;

    @Column(nullable = false)
    private Long ownerId;

    @Column(nullable = false)
    private String ownerNickname;

    @Column(nullable = false)
    private Long chatterId;

    @Column(nullable = false)
    private String chatterNickname;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private String lastMessage;

    private LocalDateTime lastMessageAt;

    @Builder.Default
    private long messageCount = 0;

    @Builder.Default
    private long unreadCount = 0;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public void updateLastMessage(String content, Long senderId) {
        this.lastMessage = content;
        this.lastMessageAt = LocalDateTime.now();
        this.messageCount++;
        // 채팅 상대(chatter)가 보낸 메시지만 읽지 않은 메시지로 카운트
        if (senderId.equals(this.chatterId)) {
            this.unreadCount++;
        }
    }

    public void markAsRead() {
        this.unreadCount = 0;
    }
}
