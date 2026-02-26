import { useNavigate } from 'react-router-dom'
import { useLocationStore } from '@/stores/useLocationStore'

const MOCK_SHARING_ITEMS = [
  {
    id: 1,
    title: '상태 좋은 3인용 소파 나눔합니다',
    location: '역삼1동',
    time: '10분 전',
    status: '나눔중' as const,
  },
  {
    id: 2,
    title: '원목 책상 가져가실 분 (흠집 약...',
    location: '도곡동',
    time: '1시간 전',
    status: '나눔중' as const,
  },
  {
    id: 3,
    title: '작은 수납장(깨끗함) 드려요',
    location: '대치동',
    time: '3시간 전',
    status: '나눔완료' as const,
  },
]

function StatusBadge({ status }: { status: '나눔중' | '예약중' | '나눔완료' }) {
  const styles = {
    '나눔중': 'bg-gray-900 text-white',
    '예약중': 'bg-gray-200 text-gray-700',
    '나눔완료': 'bg-gray-100 text-gray-400',
  }
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const currentLocation = useLocationStore((s) => s.currentLocation)
  const dongName = currentLocation?.dong || '동네 설정'

  return (
    <div>
      {/* Location Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={() => navigate('/location/auto')}
          className="flex items-center gap-1 text-base font-semibold"
        >
          {dongName}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="mt-0.5">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button onClick={() => navigate('/notifications')} className="relative p-1">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Banner Carousel */}
      <div className="px-4 pb-4">
        <div className="rounded-2xl bg-gray-900 p-5 text-white">
          <h2 className="text-lg font-bold leading-snug">
            대형폐기물 배출,
            <br />
            이제 모바일로 쉽게!
          </h2>
          <p className="mt-1 text-sm text-gray-300">온라인 신고 절차 알아보기</p>
          <div className="mt-3 flex gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            <span className="h-1.5 w-1.5 rounded-full bg-gray-500" />
            <span className="h-1.5 w-1.5 rounded-full bg-gray-500" />
          </div>
        </div>
      </div>

      {/* 자주 찾는 서비스 */}
      <div className="px-4 pb-5">
        <h3 className="mb-3 text-sm font-bold text-gray-900">자주 찾는 서비스</h3>
        <div className="flex gap-4">
          {[
            {
              label: '수수료 조회',
              path: '/fee-check',
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="7" height="7" rx="1" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="14" y="3" width="7" height="7" rx="1" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="3" y="14" width="7" height="7" rx="1" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="14" y="14" width="7" height="7" rx="1" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ),
            },
            {
              label: '온라인 신고',
              path: '/online',
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="4" y="4" width="16" height="16" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 9h6M9 13h4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ),
            },
            {
              label: '오프라인 안내',
              path: '/offline',
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="9" r="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ),
            },
            {
              label: '무상수거 안내',
              path: '/free-collection',
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ),
            },
          ].map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-1 flex-col items-center gap-2"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-gray-200">
                {item.icon}
              </div>
              <span className="text-xs text-gray-700">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 이웃들의 무료 나눔 */}
      <div className="px-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900">이웃들의 무료 나눔</h3>
          <button
            onClick={() => navigate('/sharing')}
            className="text-xs text-gray-400"
          >
            더보기 &gt;
          </button>
        </div>
        <div className="space-y-3">
          {MOCK_SHARING_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(`/sharing/${item.id}`)}
              className="flex w-full items-center gap-3 rounded-xl border border-gray-100 p-3 text-left active:bg-gray-50"
            >
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <path d="M21 15l-5-5L5 21"/>
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{item.title}</p>
                <p className="mt-0.5 text-xs text-gray-400">{item.location} · {item.time}</p>
                <div className="mt-1.5">
                  <StatusBadge status={item.status} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
