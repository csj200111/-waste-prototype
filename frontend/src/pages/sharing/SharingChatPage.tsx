import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import Header from '@/components/layout/Header'
import { useAuth } from '@/features/auth/AuthContext'
import { sharingService, type SharingPostResponse } from '@/services/sharingService'
import { chatService, type ChatMessageResponse, type ChatRoomResponse } from '@/services/chatService'

export default function SharingChatPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const postId = Number(id)
  const roomId = searchParams.get('roomId') ? Number(searchParams.get('roomId')) : null

  const [post, setPost] = useState<SharingPostResponse | null>(null)
  const [room, setRoom] = useState<ChatRoomResponse | null>(null)
  const [messages, setMessages] = useState<ChatMessageResponse[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [headerTitle, setHeaderTitle] = useState('채팅')
  const [completing, setCompleting] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const lastMessageIdRef = useRef<number>(0)
  const isPollingRef = useRef(false)
  const shouldScrollRef = useRef(false)

  const isOwner = user && post && user.id === post.authorId
  const isCompleted = post?.status === '나눔완료'

  const isNearBottom = () => {
    const el = messagesContainerRef.current
    if (!el) return true
    return el.scrollHeight - el.scrollTop - el.clientHeight < 100
  }

  useEffect(() => {
    if (!postId || !roomId) return
    sharingService.getDetail(postId).then((p) => {
      setPost(p)
      if (!(user && user.id === p.authorId)) {
        setHeaderTitle(p.authorNickname)
      }
      if (user && user.id === p.authorId) {
        chatService.markAsRead(postId, roomId).catch(() => {})
      }
    }).catch((e) => console.error('게시글 조회 실패:', e))

    // 채팅방 목록에서 현재 방 정보 가져오기
    chatService.getRooms(postId).then((rooms) => {
      const current = rooms.find((r) => r.id === roomId)
      if (current) setRoom(current)
    }).catch((e) => console.error('채팅방 조회 실패:', e))

    chatService.getMessages(postId, roomId).then((msgs) => {
      setMessages(msgs)
      if (msgs.length > 0) {
        lastMessageIdRef.current = msgs[msgs.length - 1].id
      }
      if (user && msgs.length > 0) {
        const partner = msgs.find((m) => m.senderId !== user.id)
        if (partner) setHeaderTitle(partner.senderNickname)
      }
      shouldScrollRef.current = true
    }).catch((e) => console.error('메시지 조회 실패:', e))
  }, [postId, roomId, user])

  useEffect(() => {
    if (shouldScrollRef.current) {
      shouldScrollRef.current = false
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' })
    }
  }, [messages])

  useEffect(() => {
    if (!postId || !roomId) return

    const poll = () => {
      const lastId = lastMessageIdRef.current
      if (lastId === 0 || isPollingRef.current) return

      isPollingRef.current = true
      const wasNearBottom = isNearBottom()
      chatService.getMessagesAfter(postId, roomId, lastId)
        .then((newMsgs) => {
          if (newMsgs.length > 0) {
            setMessages((prev) => {
              const existingIds = new Set(prev.map((m) => m.id))
              const uniqueNew = newMsgs.filter((m) => !existingIds.has(m.id))
              if (uniqueNew.length === 0) return prev
              return [...prev, ...uniqueNew]
            })
            lastMessageIdRef.current = newMsgs[newMsgs.length - 1].id
            if (wasNearBottom) {
              shouldScrollRef.current = true
            }
          }
        })
        .catch((e) => console.error('폴링 실패:', e))
        .finally(() => { isPollingRef.current = false })
    }

    const interval = setInterval(poll, 3000)
    return () => clearInterval(interval)
  }, [postId, roomId])

  const handleSend = async () => {
    if (!input.trim() || !user || sending || !roomId || isCompleted) return
    setSending(true)
    try {
      const msg = await chatService.send(postId, roomId, {
        senderId: user.id,
        senderNickname: user.nickname,
        content: input.trim(),
      })
      setMessages((prev) => [...prev, msg])
      lastMessageIdRef.current = msg.id
      setInput('')
      shouldScrollRef.current = true
    } catch {
      alert('메시지 전송에 실패했습니다.')
    } finally {
      setSending(false)
    }
  }

  const handleComplete = async () => {
    if (!user || !post || !room || completing) return
    if (!window.confirm(`${room.chatterNickname}님과의 거래를 완료하시겠습니까?`)) return
    setCompleting(true)
    try {
      const updated = await sharingService.completeTransaction(postId, room.chatterId, user.id)
      setPost(updated)
      alert('거래가 완료되었습니다.')
    } catch (err) {
      alert('거래 완료에 실패했습니다: ' + (err instanceof Error ? err.message : '알 수 없는 오류'))
    } finally {
      setCompleting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (dateStr: string) => {
    try {
      const parts = dateStr.split(' ')
      if (parts.length >= 2) {
        const timeParts = parts[1].split(':')
        return `${timeParts[0]}:${timeParts[1]}`
      }
      return dateStr
    } catch {
      return dateStr
    }
  }

  const firstImage = post?.imageUrls?.[0]

  return (
    <div className="fixed inset-0 z-40 mx-auto flex flex-col max-w-[428px] bg-white">
      <Header title={headerTitle} showBack showNotification />
      <div className="pt-14 flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* 상품 정보 바 */}
        {post && (
          <div className="shrink-0 border-b border-gray-100">
            <button
              onClick={() => navigate(`/sharing/${postId}`)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-100 overflow-hidden">
                {firstImage ? (
                  <img src={firstImage} alt="" className="h-full w-full object-cover" />
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
              {isOwner && !isCompleted && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleComplete()
                  }}
                  disabled={completing}
                  className="shrink-0 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white active:bg-blue-700 disabled:bg-gray-300"
                >
                  {completing ? '처리중...' : '거래완료'}
                </button>
              )}
              {isCompleted && (
                <span className="shrink-0 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-400">
                  거래완료
                </span>
              )}
            </button>
          </div>
        )}

        {/* 메시지 영역 */}
        <div ref={messagesContainerRef} className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-4">
          {messages.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-8">
              메시지가 없습니다. 첫 메시지를 보내보세요!
            </p>
          )}
          {messages.map((msg) => {
            const isMe = user != null && msg.senderId === user.id
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                {!isMe && (
                  <div className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                )}
                <div className={isMe ? 'flex flex-col items-end' : ''}>
                  {!isMe && (
                    <p className="mb-1 text-xs text-gray-500">{msg.senderNickname}</p>
                  )}
                  <div className="flex items-end gap-1.5">
                    {isMe && <span className="text-[10px] text-gray-300">{formatTime(msg.createdAt)}</span>}
                    <div className={`max-w-[240px] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-wrap ${
                      isMe
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      {msg.content}
                    </div>
                    {!isMe && <span className="text-[10px] text-gray-300">{formatTime(msg.createdAt)}</span>}
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* 입력 바 또는 거래완료 안내 */}
        {isCompleted ? (
          <div className="shrink-0 border-t border-gray-100 bg-gray-50 px-4 py-4 text-center">
            <p className="text-sm text-gray-400">거래가 완료되어 더 이상 채팅할 수 없습니다.</p>
          </div>
        ) : (
          <div className="shrink-0 border-t border-gray-100 bg-white px-4 py-3 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="메시지를 입력하세요"
              className="flex-1 rounded-full bg-gray-100 px-4 py-2.5 text-base outline-none placeholder-gray-400"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 active:bg-blue-700 disabled:bg-gray-300"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
