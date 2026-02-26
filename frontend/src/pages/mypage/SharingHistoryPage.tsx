import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '@/components/layout/Header'

const FILTERS = ['전체', '모집중', '예약중', '나눔완료']

const MOCK_ITEMS = [
  { id: 1, title: '깨끗한 나무 의자', status: '모집중', time: '10분 전', chats: 0 },
  { id: 2, title: '2단 서랍장 나눔합니다', status: '예약중', time: '2시간 전', chats: 5 },
  { id: 3, title: '안 쓰는 책상 나눔해요', status: '나눔완료', time: '3일 전', chats: 8 },
]

export default function SharingHistoryPage() {
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState('전체')
  const [expanded, setExpanded] = useState<number | null>(null)

  return (
    <div>
      <Header title="나눔 내역" showBack showNotification />
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
                  <p className="text-xs text-gray-400">
                    <span className={`inline-block rounded-full px-2 py-0.5 mr-1 text-xs font-medium ${
                      item.status === '모집중' ? 'bg-gray-900 text-white' :
                      item.status === '예약중' ? 'bg-gray-200 text-gray-700' :
                      'bg-gray-100 text-gray-400'
                    }`}>{item.status}</span>
                    {item.time} · 채팅 {item.chats}
                  </p>
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
                  <div className="flex gap-2">
                    <button className="flex-1 rounded-lg border border-gray-200 py-2 text-xs text-gray-600">상태 변경</button>
                    <button onClick={() => navigate(`/sharing/${item.id}/edit`)} className="flex-1 rounded-lg border border-gray-200 py-2 text-xs text-gray-600">수정</button>
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

        {/* Empty state */}
        <div className="mt-8 text-center">
          <p className="mb-2 text-sm text-gray-400">목록이 비어있을 경우 (Empty State)</p>
          <div className="mx-4 rounded-2xl bg-gray-50 py-8 text-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" className="mx-auto mb-2">
              <path d="M20 12v10H4V12" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 7h20v5H2z" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 22V7"/>
            </svg>
            <p className="mb-3 text-sm text-gray-400">등록한 나눔이 없어요</p>
            <button
              onClick={() => navigate('/sharing/register')}
              className="rounded-lg border border-gray-200 px-4 py-2 text-xs text-gray-600"
            >
              나눔 등록하러 가기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
