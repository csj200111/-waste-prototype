import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '@/components/layout/Header'
import { useAuth } from '@/features/auth/AuthContext'
import { sharingService, type SharingPostResponse } from '@/services/sharingService'

const FILTERS = ['전체', '진행중', '나눔완료']

export default function PurchaseHistoryPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeFilter, setActiveFilter] = useState('전체')
  const [expanded, setExpanded] = useState<number | null>(null)
  const [chattedItems, setChattedItems] = useState<SharingPostResponse[]>([])
  const [receivedItems, setReceivedItems] = useState<SharingPostResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    Promise.all([
      sharingService.getChattedPosts(user.id).catch(() => [] as SharingPostResponse[]),
      sharingService.getReceivedPosts(user.id).catch(() => [] as SharingPostResponse[]),
    ]).then(([chatted, received]) => {
      setChattedItems(chatted)
      setReceivedItems(received)
    }).finally(() => setLoading(false))
  }, [user])

  // 진행중: 채팅한 게시글 중 나눔중/예약중
  // 나눔완료: receiverId가 나인 게시글
  // 전체: 둘 다 합침
  const getFilteredItems = () => {
    if (activeFilter === '진행중') {
      return chattedItems.filter((item) => item.status === '나눔중' || item.status === '예약중')
    }
    if (activeFilter === '나눔완료') {
      return receivedItems
    }
    // 전체: 진행중 + 나눔완료 합치기 (중복 제거)
    const inProgress = chattedItems.filter((item) => item.status === '나눔중' || item.status === '예약중')
    const receivedIds = new Set(receivedItems.map((r) => r.id))
    const merged = [...inProgress]
    for (const item of receivedItems) {
      if (!merged.some((m) => m.id === item.id)) {
        merged.push(item)
      }
    }
    return merged
  }

  const filtered = getFilteredItems()

  if (!user) {
    return (
      <div>
        <Header title="나눔 받은 내역" showBack showNotification />
        <div className="flex flex-col items-center justify-center pt-14 p-4 mt-20">
          <p className="text-sm text-gray-400">로그인이 필요합니다.</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-3 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white"
          >
            로그인
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header title="나눔 받은 내역" showBack showNotification />
      <div className="pt-14">
        <div className="flex gap-2 px-4 py-3">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                activeFilter === f ? 'bg-blue-600 text-white' : 'border border-gray-200 text-gray-500'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="mt-8 text-center text-xs text-gray-400">불러오는 중...</p>
        ) : filtered.length === 0 ? (
          <p className="mt-8 text-center text-xs text-gray-300">내역이 없어요</p>
        ) : (
          <div className="px-4 space-y-3">
            {filtered.map((item) => (
              <div key={item.id} className="rounded-2xl border border-gray-100">
                <button
                  onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                  className="flex w-full items-center gap-3 p-4 text-left"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                    {item.imageUrls.length > 0 ? (
                      <img src={item.imageUrls[0]} alt="" className="h-14 w-14 rounded-xl object-cover" />
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <path d="M21 15l-5-5L5 21"/>
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-400">{item.authorNickname} · {item.createdAt}</p>
                    <span className={`inline-block mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      item.status === '나눔완료' ? 'bg-gray-100 text-gray-400' :
                      item.status === '예약중' ? 'bg-gray-200 text-gray-700' :
                      'bg-blue-600 text-white'
                    }`}>{item.status}</span>
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
                      <div className="flex justify-between"><span className="text-gray-400">상태</span><span className="text-gray-700">{item.status}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">받은 물품</span><span className="text-gray-700">{item.title}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">상대</span><span className="text-gray-700">{item.authorNickname}</span></div>
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
        )}
      </div>
    </div>
  )
}
