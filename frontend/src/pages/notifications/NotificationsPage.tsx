import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '@/components/layout/Header'
import { useAuth } from '@/features/auth/AuthContext'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { notificationService, type NotificationResponse } from '@/services/notificationService'

const ICONS: Record<string, JSX.Element> = {
  CHAT: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
}

const DEFAULT_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

function formatTime(dateStr: string) {
  try {
    const now = new Date()
    const parts = dateStr.split(' ')
    if (parts.length < 2) return dateStr

    const [datePart, timePart] = parts
    const [year, month, day] = datePart.split('-').map(Number)
    const [hour, minute] = timePart.split(':').map(Number)
    const date = new Date(year, month - 1, day, hour, minute)

    const diffMs = now.getTime() - date.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    const diffHour = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHour / 24)

    if (diffMin < 1) return '방금 전'
    if (diffMin < 60) return `${diffMin}분 전`
    if (diffHour < 24) return `${diffHour}시간 전`
    if (diffDay < 7) return `${diffDay}일 전`
    return `${month}/${day}`
  } catch {
    return dateStr
  }
}

export default function NotificationsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { decrement, reset, setUnreadCount } = useNotificationStore()
  const [notifications, setNotifications] = useState<NotificationResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    notificationService.getNotifications(user.id)
      .then(setNotifications)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  const handleClick = async (noti: NotificationResponse) => {
    if (!noti.isRead) {
      notificationService.markAsRead(noti.id).catch(() => {})
      setNotifications((prev) =>
        prev.map((n) => (n.id === noti.id ? { ...n, isRead: true } : n))
      )
      decrement()
    }
    navigate(noti.link)
  }

  const handleReadAll = async () => {
    if (!user) return
    notificationService.markAllAsRead(user.id).catch(() => {})
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    reset()
  }

  const hasUnread = notifications.some((n) => !n.isRead)

  return (
    <div>
      <Header
        title="알림"
        showBack
        rightContent={
          hasUnread ? (
            <button
              onClick={handleReadAll}
              className="text-xs text-blue-600 font-medium px-2 py-1"
            >
              모두 읽음
            </button>
          ) : undefined
        }
      />
      <div className="pt-14">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-sm text-gray-400">불러오는 중...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center py-16">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" className="mb-3">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="text-sm text-gray-400">알림이 없습니다</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map((noti) => (
              <button
                key={noti.id}
                onClick={() => handleClick(noti)}
                className={`flex w-full items-center gap-3 px-4 py-4 text-left active:bg-gray-50 ${
                  !noti.isRead ? 'bg-blue-50/50' : ''
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50">
                  {ICONS[noti.type] || DEFAULT_ICON}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {!noti.isRead && (
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0" />
                      )}
                      <p className="text-sm font-medium text-gray-900">{noti.title}</p>
                    </div>
                    <span className="shrink-0 text-xs text-gray-300">{formatTime(noti.createdAt)}</span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-gray-400">{noti.message}</p>
                </div>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="#ccc" strokeWidth="1.5">
                  <path d="M7.5 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
