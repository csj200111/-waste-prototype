import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '@/components/layout/Header'

const FAQ_ITEMS = [
  {
    q: '오프라인으로 배출 스티커는 어디서 사나요?',
    a: '동사무소(주민센터), 구청, 편의점 등 지정 판매소에서 구매할 수 있습니다. 지도 보기에서 가까운 판매소를 확인하세요.',
  },
  {
    q: '종량제 봉투에 담아서 버려도 되나요?',
    a: '대형폐기물은 종량제 봉투에 담아서 버릴 수 없습니다. 반드시 배출 신고 후 스티커를 부착하여 배출해야 합니다.',
  },
  {
    q: '가전제품 무상수거는 어떻게 신청하나요?',
    a: '폐가전 무상방문수거 홈페이지(15990903.or.kr)를 통해 예약하거나, 콜센터 1599-0903으로 전화하여 접수할 수 있습니다.',
  },
]

export default function OfflinePage() {
  const navigate = useNavigate()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div>
      <Header title="오프라인 안내" showBack showNotification />
      <div className="pt-14 p-4">
        <h2 className="mt-2 mb-4 text-base font-bold text-gray-900">원하시는 안내를 선택해주세요</h2>

        {/* 안내 카드 */}
        <div className="space-y-3 mb-8">
          <button
            onClick={() => navigate('/offline/map')}
            className="flex w-full items-center gap-4 rounded-2xl border border-gray-100 p-4 text-left active:bg-gray-50"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-100">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="9" r="2.5"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900">지도 보기</p>
              <p className="text-xs text-gray-400">주변 처리소 및 판매소 찾기</p>
            </div>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#ccc" strokeWidth="1.5">
              <path d="M7.5 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <button
            onClick={() => navigate('/fee-check')}
            className="flex w-full items-center gap-4 rounded-2xl border border-gray-100 p-4 text-left active:bg-gray-50"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-100">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
                <rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900">수수료 조회</p>
              <p className="text-xs text-gray-400">품목별 배출 수수료 확인하기</p>
            </div>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#ccc" strokeWidth="1.5">
              <path d="M7.5 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* 자주 묻는 질문 */}
        <h3 className="mb-3 text-base font-bold text-gray-900">자주 묻는 질문</h3>
        <div className="space-y-2">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className="rounded-2xl bg-gray-50">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between p-4 text-left"
              >
                <span className="pr-4 text-sm text-gray-700">{item.q}</span>
                <svg
                  width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#999" strokeWidth="1.5"
                  className={`shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                >
                  <path d="M5 7.5l5 5 5-5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4">
                  <p className="text-xs leading-relaxed text-gray-500">{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
