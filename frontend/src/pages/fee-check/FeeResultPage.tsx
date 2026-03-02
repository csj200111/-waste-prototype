import { useNavigate, useLocation } from 'react-router-dom'
import Header from '@/components/layout/Header'
import type { SelectedFeeItem } from './ItemSearchPage'

export default function FeeResultPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const items: SelectedFeeItem[] =
    (location.state as { confirmedItems?: SelectedFeeItem[] })?.confirmedItems || []
  const totalFee = items.reduce((s, i) => s + i.fee * i.qty, 0)
  const totalQty = items.reduce((s, i) => s + i.qty, 0)

  return (
    <div>
      <Header title="수수료 계산 결과" showBack showNotification />
      <div className="pt-14 p-4">
        {/* 총 수수료 */}
        <div className="mb-6 rounded-2xl bg-blue-50 p-6 text-center">
          <p className="text-sm text-blue-600 font-medium">예상 수수료</p>
          <p className="mt-2 text-4xl font-bold text-gray-900">
            {totalFee.toLocaleString()}<span className="text-2xl">원</span>
          </p>
          <p className="mt-1 text-xs text-gray-500">
            선택 품목 {items.length}개 · 총 {totalQty}개
          </p>
        </div>

        {/* 상세 내역 */}
        <h3 className="mb-3 text-sm font-bold text-gray-900">상세 내역</h3>
        <div className="mb-6 rounded-2xl border border-gray-100 divide-y divide-gray-50">
          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium text-gray-900">{item.wasteName}</p>
                <p className="text-xs text-gray-400">
                  {item.wasteStandard && `${item.wasteStandard} · `}
                  수량 {item.qty}개
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">
                  {(item.fee * item.qty).toLocaleString()}원
                </p>
                {item.qty > 1 && (
                  <p className="text-xs text-gray-400">@{item.fee.toLocaleString()}원</p>
                )}
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-sm text-gray-400">품목 정보가 없습니다</p>
            </div>
          )}
        </div>

        {/* 버튼 */}
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => navigate('/fee-check')}
            className="flex-1 rounded-xl border border-gray-200 py-3.5 text-sm font-semibold text-gray-700 active:bg-gray-50"
          >
            다시 조회
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 rounded-xl border border-gray-200 py-3.5 text-sm font-semibold text-gray-700 active:bg-gray-50"
          >
            홈으로
          </button>
        </div>

        {/* 온라인 신고 CTA */}
        <button
          onClick={() => navigate('/online')}
          className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white active:bg-blue-700"
        >
          온라인 신고(유료)로 진행
        </button>
      </div>
    </div>
  )
}
