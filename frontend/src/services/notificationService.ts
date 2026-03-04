import { apiFetch } from '@/lib/apiClient'

export interface NotificationResponse {
  id: number
  userId: number
  type: string
  title: string
  message: string
  link: string
  isRead: boolean
  createdAt: string
}

export interface UnreadCountResponse {
  count: number
}

export const notificationService = {
  getNotifications(userId: number) {
    return apiFetch<NotificationResponse[]>('/api/notifications', {
      headers: { 'X-User-Id': String(userId) },
    })
  },
  getUnreadCount(userId: number) {
    return apiFetch<UnreadCountResponse>('/api/notifications/unread-count', {
      headers: { 'X-User-Id': String(userId) },
    })
  },
  markAsRead(notificationId: number) {
    return apiFetch<void>(`/api/notifications/${notificationId}/read`, { method: 'PATCH' })
  },
  markAllAsRead(userId: number) {
    return apiFetch<void>('/api/notifications/read-all', {
      method: 'PATCH',
      headers: { 'X-User-Id': String(userId) },
    })
  },
}
