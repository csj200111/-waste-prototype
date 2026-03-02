import { useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocationStore } from '@/stores/useLocationStore'
import { useAuth } from '@/features/auth/AuthContext'
import MapView from '@/components/map/MapView'

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

function HomeBanner({
  currentLocation,
  dongName,
  navigate,
}: {
  currentLocation: { latitude: number; longitude: number } | null
  dongName: string
  navigate: ReturnType<typeof useNavigate>
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeSlide, setActiveSlide] = useState(0)

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const index = Math.round(el.scrollLeft / el.offsetWidth)
    setActiveSlide(index)
  }, [])

  const goToSlide = (index: number) => {
    scrollRef.current?.scrollTo({ left: index * (scrollRef.current?.offsetWidth ?? 0), behavior: 'smooth' })
  }

  return (
    <div className="px-4 pb-4">
      {/* 슬라이드 컨테이너 */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory overflow-x-auto rounded-xl scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* 슬라이드 1: 서비스 이용 가이드 */}
        <div className="w-full shrink-0 snap-start">
          <button
            onClick={() => navigate('/guide')}
            className="relative flex h-[180px] w-full flex-col justify-between rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 p-5 text-left text-white"
          >
            <div>
              <p className="text-xs font-medium text-blue-100">서비스 이용 안내</p>
              <h3 className="mt-1 text-base font-bold leading-snug">
                버려잇 사용법,<br />한눈에 알아보기
              </h3>
              <p className="mt-2 text-xs text-blue-200">
                수수료 조회부터 온라인 신고까지
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-blue-100">
              자세히 보기
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            {/* 장식 아이콘 */}
            <div className="absolute right-5 top-5 opacity-20">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1">
                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </button>
        </div>

        {/* 슬라이드 2: 지도 */}
        <div className="w-full shrink-0 snap-start">
          <MapView
            markers={
              currentLocation
                ? [{ lat: currentLocation.latitude, lng: currentLocation.longitude, title: dongName }]
                : []
            }
            className="!h-[180px]"
          />
        </div>
      </div>

      {/* 인디케이터 점 */}
      <div className="mt-2 flex justify-center gap-1.5">
        {[0, 1].map((i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            className={`h-1.5 rounded-full transition-all ${
              activeSlide === i ? 'w-4 bg-blue-600' : 'w-1.5 bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const currentLocation = useLocationStore((s) => s.currentLocation)
  const { user } = useAuth()
  const dongName = currentLocation?.dong || '동네 설정'

  return (
    <div>
      {/* 비로그인 배너 */}
      {!user && (
        <div className="flex items-center justify-between bg-blue-50 px-4 py-2.5">
          <span className="text-sm text-blue-700">로그인 후 이용 가능한 기능이 있어요.</span>
          <button
            onClick={() => navigate('/login')}
            className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white"
          >
            로그인
          </button>
        </div>
      )}

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

      {/* 슬라이드 배너 영역 */}
      <HomeBanner
        currentLocation={currentLocation}
        dongName={dongName}
        navigate={navigate}
      />

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
