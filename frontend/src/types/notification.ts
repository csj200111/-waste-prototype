export type NotificationType =
  | 'disposal_complete'
  | 'new_chat'
  | 'payment_complete'
  | 'scrap_shared'
  | 'collection_complete';

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}
