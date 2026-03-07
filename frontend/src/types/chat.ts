import type { SharingStatus } from './sharing';

export interface ChatRoom {
  id: number;
  sharingItemId: number;
  sharingTitle: string;
  sharingStatus: SharingStatus;
  otherUserId: number;
  otherUserNickname: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface ChatMessage {
  id: number;
  roomId: number;
  senderId: number;
  content: string;
  createdAt: string;
  isMe: boolean;
}
