import { useNavigate, useLocation } from 'react-router-dom'
import Header from '@/components/layout/Header'

const MOCK_SELECTED = [
  { id: 1, name: '의자 (일반)', fee: 2000, qty: 1 },
  { id: 2, name: '침대 (1인용)', fee: 5000, qty: 1 },
]

export default function ItemConfirmPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const isOnline = location.pathname.startsWith('/online')
  const basePath = isOnline ? '/online' : '/fee-check'

  const totalQty = MOCK_SELECTED.reduce((s, i) => s + i.qty, 0)
  const totalFee = MOCK_SELECTED.reduce((s, i) => s + i.fee * i.qty, 0)

  return (
    <div>
      <Header title="선택 품목 확인" showBack showNotification />
      <div className="pt-14 p-4">
        {/* 선택된 품목 */}
        <div className="space-y-3 mb-4">
          {MOCK_SELECTED.map((item) => (
            <div key={item.id} className="rounded-2xl border border-gray-100 p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-400">{item.fee.toLocaleString()}원</p>
                </div>
                <button className="text-gray-300">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
              <div className="flex items-center justify-end gap-3">
                <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600">−</button>
                <span className="w-6 text-center text-sm font-medium">{item.qty}</span>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600">+</button>
              </div>
            </div>
          ))}
        </div>

        {/* 요약 */}
        <div className="mb-6 rounded-2xl bg-gray-50 p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">총 수량</span>
            <span className="font-medium text-gray-900">{totalQty}개</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">예상 수수료</span>
            <span className="text-lg font-bold text-gray-900">{totalFee.toLocaleString()}원</span>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 rounded-xl border border-gray-200 py-3.5 text-sm font-semibold text-gray-700 active:bg-gray-50"
          >
            품목 추가
          </button>
          <button
            onClick={() => navigate(`${basePath}/result`)}
            className="flex-1 rounded-xl bg-gray-900 py-3.5 text-sm font-semibold text-white active:bg-gray-800"
          >
            확정
          </button>
        </div>
      </div>
    </div>
  )
}
