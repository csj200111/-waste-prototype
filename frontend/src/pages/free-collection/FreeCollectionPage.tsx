import { useNavigate } from 'react-router-dom'
import Header from '@/components/layout/Header'

const INFO_CARDS = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="7" width="20" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 7V5a4 4 0 00-8 0v2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: '무상수거 대상',
    desc: '냉장고, 세탁기, 에어컨, TV 등 대형 가전제품을 대상으로 합니다. 청소기, 선풍기 등 소형 가전제품은 5개 이상 동시 배출 시 무상수거가 가능합니다.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: '수거 조건',
    desc: '원형이 크게 훼손되지 않은 제품만 수거가 가능합니다. 컴프레서, 모터 등 주요 부품이 누락된 폐가전은 무상수거가 불가하며 관할 지자체를 통해 유료 배출하셔야 합니다.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: '신청 방법 및 문의',
    desc: '폐가전 무상방문수거 홈페이지(15990903.or.kr)를 통해 예약하거나, 콜센터 1599-0903으로 전화하여 접수할 수 있습니다. (운영시간: 평일 08:00 ~ 18:00)',
  },
]

export default function FreeCollectionPage() {
  const navigate = useNavigate()

  return (
    <div>
      <Header title="무상수거 안내" showBack showNotification />
      <div className="pt-14 p-4 space-y-4">
        {INFO_CARDS.map((card, i) => (
          <div key={i} className="rounded-2xl border border-gray-100 p-5">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                {card.icon}
              </div>
              <h3 className="text-sm font-bold text-gray-900">{card.title}</h3>
            </div>
            <p className="text-sm leading-relaxed text-gray-600">{card.desc}</p>
          </div>
        ))}

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => navigate('/')}
            className="flex-1 rounded-xl border border-gray-200 py-3.5 text-sm font-semibold text-gray-700 active:bg-gray-50"
          >
            홈으로
          </button>
          <button
            onClick={() => navigate('/offline')}
            className="flex-1 rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white active:bg-blue-700"
          >
            오프라인 안내 보기
          </button>
        </div>
      </div>
    </div>
  )
}
