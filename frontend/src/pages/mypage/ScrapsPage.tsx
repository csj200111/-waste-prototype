import { useNavigate } from 'react-router-dom'
import Header from '@/components/layout/Header'

const MOCK_SCRAPS = [
  { id: 1, title: '깨끗한 원목 식탁 의자 2개 나...', location: '강남구 역삼동', time: '2시간 전', status: '나눔중' },
  { id: 2, title: '이삿짐 정리 전자레인지 가져가...', location: '서초구 방배동', time: '5시간 전', status: '나눔중' },
  { id: 3, title: '아이들 책상 (사용감 약간 있음)...', location: '송파구 잠실동', time: '1일 전', status: '나눔완료' },
  { id: 4, title: '접이식 미니 자전거 상태 좋습...', location: '동작구 사당동', time: '2일 전', status: '나눔완료' },
]

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
      status === '나눔중' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'
    }`}>
      {status}
    </span>
  )
}

export default function ScrapsPage() {
  const navigate = useNavigate()

  return (
    <div>
      <Header title="스크랩 목록" showBack showNotification />
      <div className="pt-14">
        <div className="divide-y divide-gray-50">
          {MOCK_SCRAPS.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(`/sharing/${item.id}`)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-gray-50"
            >
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
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
