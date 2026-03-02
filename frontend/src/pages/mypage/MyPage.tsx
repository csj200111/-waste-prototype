import { useNavigate } from 'react-router-dom'
import Header from '@/components/layout/Header'
import { useAuth } from '@/features/auth/AuthContext'
import { useLocationStore } from '@/stores/useLocationStore'

const HISTORY_ITEMS = [
  {
    label: '배출 내역',
    desc: '대형 폐기물 배출 신고 목록',
    path: '/mypage/disposal',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    label: '구매 내역',
    desc: '온라인 신고 결제 내역',
    path: '/mypage/purchases',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    label: '나눔 내역',
    desc: '등록한 무료 나눔 목록',
    path: '/mypage/sharing',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20 12v10H4V12" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 7h20v5H2z" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 22V7" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
]

const MANAGE_ITEMS = [
  { label: '결제수단', path: '/mypage/payment-methods' },
  { label: '스크랩 목록', path: '/mypage/scraps' },
  { label: '설정', path: '/mypage/settings' },
]

export default function MyPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const currentLocation = useLocationStore((s) => s.currentLocation)

  const locationText = currentLocation
    ? `${currentLocation.sigungu} ${currentLocation.dong}`
    : '동네 설정 필요'

  return (
    <div>
      <Header title="마이페이지" showBack showNotification />
      <div className="pt-14 p-4">
        {/* 프로필 카드 */}
        {user ? (
          <div className="mb-6 flex items-center gap-4 rounded-2xl bg-gray-50 p-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gray-200">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p className="text-base font-bold text-gray-900">{user.nickname}</p>
              <p className="text-xs text-gray-400">{locationText}</p>
            </div>
          </div>
        ) : (
          <div className="mb-6 rounded-2xl bg-gray-50 p-6 text-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" className="mx-auto mb-3">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="text-sm font-medium text-gray-700 mb-1">로그인이 필요합니다</p>
            <p className="text-xs text-gray-400 mb-4">로그인 후 더 많은 기능을 이용하세요</p>
            <button
              onClick={() => navigate('/login')}
              className="rounded-xl bg-blue-600 px-8 py-3 text-sm font-semibold text-white active:bg-blue-700"
            >
              로그인하기
            </button>
          </div>
        )}

        {/* 내역 섹션 */}
        <h3 className="mb-3 text-sm font-bold text-gray-900">내역</h3>
        <div className="mb-6 space-y-3">
          {HISTORY_ITEMS.map((item) => (
            <button
              key={item.path}
              onClick={() => user ? navigate(item.path) : navigate('/login')}
              className="flex w-full items-center gap-4 rounded-2xl border border-gray-100 p-4 text-left active:bg-gray-50"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100">
                {item.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#ccc" strokeWidth="1.5">
                <path d="M7.5 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          ))}
        </div>

        {/* 관리 섹션 */}
        <h3 className="mb-3 text-sm font-bold text-gray-900">관리</h3>
        <div className="rounded-2xl border border-gray-100 divide-y divide-gray-100">
          {MANAGE_ITEMS.map((item) => (
            <button
              key={item.path}
              onClick={() => user ? navigate(item.path) : navigate('/login')}
              className="flex w-full items-center justify-between px-4 py-4 text-left active:bg-gray-50"
            >
              <span className="text-sm text-gray-700">{item.label}</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#ccc" strokeWidth="1.5">
                <path d="M7.5 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
