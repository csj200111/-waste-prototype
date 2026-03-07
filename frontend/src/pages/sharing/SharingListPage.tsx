import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '@/components/layout/Header'
import { useLocationStore } from '@/stores/useLocationStore'
import { sharingService, type SharingPostResponse } from '@/services/sharingService'

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    '나눔중': 'bg-[#168C4D] text-white',
    '예약중': 'bg-gray-200 text-gray-700',
    '나눔완료': 'bg-gray-100 text-gray-400',
  }
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || ''}`}>
      {status}
    </span>
  )
}

export default function SharingListPage() {
  const navigate = useNavigate()
  const loc = useLocationStore((s) => s.currentLocation)
  const dong = loc?.dong || '지역 설정'
  const [keyword, setKeyword] = useState('')
  const [items, setItems] = useState<SharingPostResponse[]>([])
  const [loading, setLoading] = useState(false)

  const sigungu = loc?.sigungu || ''

  const fetchList = useCallback(async () => {
    setLoading(true)
    try {
      const data = await sharingService.getList({ sigungu: sigungu || undefined, keyword: keyword || undefined })
      setItems(data)
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [sigungu, keyword])

  useEffect(() => {
    fetchList()
  }, [fetchList])

  return (
    <div>
      <Header title="무료 나눔" showBack showNotification />
      <div className="pt-14">
        {/* 검색 바 */}
        <div className="flex items-center gap-2 px-4 py-3">
          <button
            onClick={() => navigate('/location/manual', { state: { returnTo: '/sharing' } })}
            className="flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1.5 text-sm active:bg-gray-50"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            {dong}
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 4.5L6 7.5L9 4.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="flex flex-1 items-center gap-2 rounded-full bg-gray-100 px-3 py-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="나눔 물품 검색"
              className="flex-1 bg-transparent text-sm outline-none placeholder-gray-400"
            />
            {keyword && (
              <button onClick={() => setKeyword('')} className="text-gray-400">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* 지역 안내 */}
        {sigungu && (
          <div className="px-4 pb-1">
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
              {loc?.sido} {sigungu} 게시글
            </span>
          </div>
        )}

        {/* 목록 */}
        <div className="divide-y divide-gray-50">
          {loading && (
            <div className="py-16 text-center">
              <p className="text-sm text-gray-400">불러오는 중...</p>
            </div>
          )}
          {!loading && items.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-sm text-gray-400">
                {sigungu ? `${sigungu} 지역의 나눔 게시글이 없습니다` : '지역을 설정해 주세요'}
              </p>
            </div>
          )}
          {!loading && items.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(`/sharing/${item.id}`)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-gray-50"
            >
              <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-xl bg-gray-100 overflow-hidden">
                {item.imageUrls?.[0] ? (
                  <img src={item.imageUrls[0]} alt={item.title} className="h-full w-full object-cover" />
                ) : (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <path d="M21 15l-5-5L5 21"/>
                  </svg>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{item.title}</p>
                <p className="mt-0.5 text-xs text-gray-400">{item.dong} · {item.createdAt}</p>
                <div className="mt-2">
                  <StatusBadge status={item.status} />
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* FAB 등록 버튼 */}
        <button
          onClick={() => navigate('/sharing/register')}
          className="fixed bottom-20 right-4 flex items-center gap-1.5 rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg active:bg-blue-700"
          style={{ maxWidth: 428, right: 'max(16px, calc((100vw - 428px) / 2 + 16px))' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2">
            <path d="M8 3v10M3 8h10" strokeLinecap="round"/>
          </svg>
          등록
        </button>
      </div>
    </div>
  )
}
