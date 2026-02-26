import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '@/components/layout/Header'

const FILTERS = ['전체', '진행중', '거래완료']

const MOCK_ITEMS = [
  { id: 1, title: '깨끗한 나무 의자', seller: '초록동네님', time: '1일 전', chats: 2 },
  { id: 2, title: '슬리퍼 수건 세트', seller: '해질녘님', time: '어제', chats: 3, status: '진행중' },
  { id: 3, title: '소형 선풍기 받았어요', seller: '시원바람님', time: '2024.03.01', chats: 5 },
]

export default function PurchaseHistoryPage() {
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState('전체')
  const [expanded, setExpanded] = useState<number | null>(null)

  return (
    <div>
      <Header title="구매 내역" showBack showNotification />
      <div className="pt-14">
        <div className="flex gap-2 px-4 py-3">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                activeFilter === f ? 'bg-gray-900 text-white' : 'border border-gray-200 text-gray-500'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="px-4 space-y-3">
          {MOCK_ITEMS.map((item) => (
            <div key={item.id} className="rounded-2xl border border-gray-100">
              <button
                onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                className="flex w-full items-center gap-3 p-4 text-left"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <path d="M21 15l-5-5L5 21"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-400">{item.seller} · {item.time}</p>
                  <p className="text-xs text-gray-400">채팅 {item.chats}</p>
                </div>
                <svg
                  width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#999" strokeWidth="1.5"
                  className={`shrink-0 transition-transform ${expanded === item.id ? 'rotate-180' : ''}`}
                >
                  <path d="M5 7.5l5 5 5-5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {expanded === item.id && (
                <div className="border-t border-gray-50 px-4 pb-4 pt-3 space-y-2">
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-gray-400">상태</span><span className="text-gray-700">{item.status || '진행중'}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">받은 물품</span><span className="text-gray-700">{item.title}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">상대</span><span className="text-gray-700">{item.seller}</span></div>
                  </div>
                  <button
                    onClick={() => navigate(`/sharing/${item.id}/chat`)}
                    className="w-full rounded-lg bg-gray-900 py-2.5 text-xs font-semibold text-white"
                  >
                    채팅으로 이동
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-gray-300">내역이 없어요</p>
      </div>
    </div>
  )
}
