import { useState } from 'react'
import Header from '@/components/layout/Header'

interface Message {
  id: number
  sender: 'me' | 'other'
  name?: string
  text: string
  time: string
}

const INITIAL_MESSAGES: Message[] = [
  { id: 1, sender: 'other', name: '이웃주민', text: '안녕하세요! 혹시 의자 아직 있나요?', time: '10:30' },
  { id: 2, sender: 'me', text: '네, 아직 있습니다.', time: '10:32' },
  { id: 3, sender: 'other', name: '이웃주민', text: '오늘 저녁 7시쯤 가지러 가도 될까요?', time: '10:35' },
  { id: 4, sender: 'me', text: '네 7시에 집 앞으로 오시면 됩니다.', time: '10:40' },
]

export default function SharingChatPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (!input.trim()) return
    const now = new Date()
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: 'me', text: input.trim(), time },
    ])
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <Header title="이웃주민" showBack showNotification />
      <div className="pt-14 flex-1 flex flex-col">
        {/* 상품 정보 바 */}
        <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-100">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <path d="M21 15l-5-5L5 21"/>
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">원목 의자 무료 나눔합니다</p>
            <p className="text-xs text-gray-400">나눔중</p>
          </div>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#ccc" strokeWidth="1.5">
            <path d="M7.5 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* 날짜 */}
        <div className="py-3 text-center text-xs text-gray-400">2023년 10월 24일</div>

        {/* 메시지 영역 */}
        <div className="flex-1 overflow-y-auto px-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === 'other' && (
                <div className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
              )}
              <div className={msg.sender === 'me' ? 'flex flex-col items-end' : ''}>
                {msg.sender === 'other' && msg.name && (
                  <p className="mb-1 text-xs text-gray-500">{msg.name}</p>
                )}
                <div className="flex items-end gap-1.5">
                  {msg.sender === 'me' && <span className="text-[10px] text-gray-300">{msg.time}</span>}
                  <div className={`max-w-[240px] rounded-2xl px-3.5 py-2.5 text-sm ${
                    msg.sender === 'me'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    {msg.text}
                  </div>
                  {msg.sender === 'other' && <span className="text-[10px] text-gray-300">{msg.time}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 입력 바 */}
        <div className="border-t border-gray-100 px-4 py-3 flex items-center gap-2">
          <button className="shrink-0 p-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5">
              <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
            </svg>
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요"
            className="flex-1 rounded-full bg-gray-100 px-4 py-2.5 text-sm outline-none placeholder-gray-400"
          />
          <button
            onClick={handleSend}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 active:bg-blue-700"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
