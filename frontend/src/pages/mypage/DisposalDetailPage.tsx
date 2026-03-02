import { useNavigate } from 'react-router-dom'
import Header from '@/components/layout/Header'

export default function DisposalDetailPage() {
  const navigate = useNavigate()

  return (
    <div>
      <Header title="배출 내역 상세" showBack showNotification />
      <div className="pt-14 p-4 space-y-4">
        {/* 배출번호 */}
        <div className="rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">배출번호</p>
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">수거 대기</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-3">20231024-0012</p>
          <div className="flex gap-2">
            <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 text-xs text-gray-600">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="9" y="9" width="13" height="13" rx="2"/>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
              </svg>
              복사하기
            </button>
            <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 text-xs text-gray-600">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/>
              </svg>
              공유하기
            </button>
          </div>
        </div>

        {/* 결제 정보 */}
        <div className="rounded-2xl border border-gray-100 p-5 space-y-3">
          <h3 className="text-sm font-bold text-gray-900">결제 정보</h3>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">총 결제 금액</span>
            <span className="font-bold text-gray-900">5,000원</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">결제 수단</span>
            <span className="text-gray-700">신용카드 (현대)</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">결제 일시</span>
            <span className="text-gray-700">2023.10.24 14:32</span>
          </div>
        </div>

        {/* 배출 품목 */}
        <div className="rounded-2xl border border-gray-100 p-5">
          <h3 className="mb-3 text-sm font-bold text-gray-900">배출 품목</h3>
          <div className="divide-y divide-gray-50">
            {[
              { name: '의자 (일반/등받이 부착)', qty: 1, fee: '2,000' },
              { name: '의자 (회전/바퀴 부착)', qty: 1, fee: '3,000' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-400">수량 {item.qty}개</p>
                </div>
                <p className="text-sm font-bold text-gray-900">{item.fee}원</p>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => navigate('/mypage/disposal')}
          className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white active:bg-blue-700"
        >
          목록으로
        </button>
      </div>
    </div>
  )
}
