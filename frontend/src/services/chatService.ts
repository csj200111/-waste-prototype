import { apiFetch } from '@/lib/apiClient'

export interface ChatRoomResponse {
  id: number
  sharingPostId: number
  ownerId: number
  ownerNickname: string
  chatterId: number
  chatterNickname: string
  lastMessage: string | null
  lastMessageAt: string | null
  messageCount: number
  unreadCount: number
}

export interface ChatMessageResponse {
  id: number
  chatRoomId: number
  senderId: number
  senderNickname: string
  content: string
  createdAt: string
}

export interface ChatMessageRequest {
  senderId: number
  senderNickname: string
  content: string
}

export const chatService = {
  /** 채팅방 생성 또는 기존 채팅방 반환 */
  getOrCreateRoom(postId: number, chatterId: number, chatterNickname: string) {
    return apiFetch<ChatRoomResponse>(`/api/sharing/${postId}/chat/rooms`, {
      method: 'POST',
      body: JSON.stringify({ chatterId, chatterNickname }),
    })
  },

  /** 게시글의 채팅방 목록 조회 (게시글 작성자용) */
  getRooms(postId: number) {
    return apiFetch<ChatRoomResponse[]>(`/api/sharing/${postId}/chat/rooms`)
  },

  /** 채팅방 메시지 조회 */
  getMessages(postId: number, roomId: number) {
    return apiFetch<ChatMessageResponse[]>(`/api/sharing/${postId}/chat/rooms/${roomId}/messages`)
  },

  /** 특정 ID 이후의 새 메시지만 조회 */
  getMessagesAfter(postId: number, roomId: number, afterId: number) {
    return apiFetch<ChatMessageResponse[]>(`/api/sharing/${postId}/chat/rooms/${roomId}/messages?afterId=${afterId}`)
  },

  /** 메시지 전송 */
  send(postId: number, roomId: number, data: ChatMessageRequest) {
    return apiFetch<ChatMessageResponse>(`/api/sharing/${postId}/chat/rooms/${roomId}/messages`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /** 채팅방 읽음 처리 */
  markAsRead(postId: number, roomId: number) {
    return apiFetch<void>(`/api/sharing/${postId}/chat/rooms/${roomId}/read`, {
      method: 'PATCH',
    })
  },
}
