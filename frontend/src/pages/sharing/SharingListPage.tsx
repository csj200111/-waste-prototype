import { useNavigate } from 'react-router-dom'
import Header from '@/components/layout/Header'
import { useLocationStore } from '@/stores/useLocationStore'

const MOCK_ITEMS = [
  { id: 1, title: '원목 의자 무료 나눔합니다', location: '역삼동', time: '10분 전', status: '나눔중' as const },
  { id: 2, title: '안 쓰는 스탠드 조명 가져가세요', location: '도곡동', time: '45분 전', status: '나눔중' as const },
  { id: 3, title: '이사 정리로 1인용 책상 드립니...', location: '대치동', time: '2시간 전', status: '예약중' as const },
  { id: 4, title: '전자레인지 (작동 잘됨)', location: '역삼동', time: '1일 전', status: '나눔완료' as const },
  { id: 5, title: '철제 2단 선반 (조립식)', location: '개포동', time: '2일 전', status: '나눔완료' as const },
]

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    '나눔중': 'bg-gray-900 text-white',
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
  const dong = useLocationStore((s) => s.currentLocation?.dong) || '역삼동'

  return (
    <div>
      <Header title="무료 나눔" showBack showNotification />
      <div className="pt-14">
        {/* 검색 바 */}
        <div className="flex items-center gap-2 px-4 py-3">
          <button className="flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1.5 text-sm">
            {dong}
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 4.5L6 7.5L9 4.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="flex flex-1 items-center gap-2 rounded-full bg-gray-100 px-3 py-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <span className="text-sm text-gray-400">나눔 물품 검색</span>
          </div>
        </div>

        {/* 목록 */}
        <div className="divide-y divide-gray-50">
          {MOCK_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(`/sharing/${item.id}`)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-gray-50"
            >
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <path d="M21 15l-5-5L5 21"/>
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{item.title}</p>
                <p className="mt-0.5 text-xs text-gray-400">{item.location} · {item.time}</p>
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
          className="fixed bottom-20 right-4 flex items-center gap-1.5 rounded-full bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-lg active:bg-gray-800"
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
