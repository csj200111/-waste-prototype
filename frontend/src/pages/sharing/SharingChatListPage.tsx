import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '@/components/layout/Header'
import { sharingService, type SharingPostResponse } from '@/services/sharingService'
import { chatService, type ChatRoomResponse } from '@/services/chatService'

export default function SharingChatListPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const postId = Number(id)

  const [post, setPost] = useState<SharingPostResponse | null>(null)
  const [rooms, setRooms] = useState<ChatRoomResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!postId) return
    Promise.all([
      sharingService.getDetail(postId).catch((e) => { console.error('게시글 조회 실패:', e); return null }),
      chatService.getRooms(postId).catch((e) => { console.error('채팅방 목록 조회 실패:', e); return [] as ChatRoomResponse[] }),
    ]).then(([p, r]) => {
      setPost(p)
      setRooms(r)
    }).finally(() => setLoading(false))
  }, [postId])

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return ''
    try {
      const parts = dateStr.split(' ')
      if (parts.length >= 2) {
        const datePart = parts[0]
        const timeParts = parts[1].split(':')
        const today = new Date().toISOString().split('T')[0]
        if (datePart === today) {
          return `${timeParts[0]}:${timeParts[1]}`
        }
        const [, month, day] = datePart.split('-')
        return `${Number(month)}/${Number(day)}`
      }
      return dateStr
    } catch {
      return dateStr
    }
  }

  if (loading) {
    return (
      <div>
        <Header title="채팅 목록" showBack />
        <div className="flex items-center justify-center pt-14 h-64">
          <p className="text-sm text-gray-400">불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header title="채팅 목록" showBack />
      <div className="pt-14">
        {/* 게시글 정보 */}
        {post && (
          <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-100 overflow-hidden">
              {post.imageUrls?.[0] ? (
                <img src={post.imageUrls[0]} alt="" className="h-full w-full object-cover" />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <path d="M21 15l-5-5L5 21"/>
                </svg>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{post.title}</p>
              <p className="text-xs text-gray-400">{post.status}</p>
            </div>
          </div>
        )}

        {/* 채팅방 목록 */}
        {rooms.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => navigate(`/sharing/${postId}/chat?roomId=${room.id}`)}
                className="flex w-full items-center gap-3 px-4 py-4 text-left active:bg-gray-50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">{room.chatterNickname}</p>
                    <span className="text-[11px] text-gray-400 shrink-0 ml-2">{formatTime(room.lastMessageAt)}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500 truncate">
                    {room.lastMessage || '대화를 시작해보세요'}
                  </p>
                </div>
                {room.unreadCount > 0 && (
                  <span className="shrink-0 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                    {room.unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-16">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" className="mb-3">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="text-sm text-gray-400">아직 채팅이 없습니다</p>
          </div>
        )}
      </div>
    </div>
  )
}
