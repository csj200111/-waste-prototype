import { useNavigate } from 'react-router-dom'
import Header from '@/components/layout/Header'

const MOCK_ITEMS = [
  { name: '의자', qty: 1, unitFee: 4000, totalFee: 4000 },
  { name: '침대 프레임', qty: 1, unitFee: 5000, totalFee: 5000 },
  { name: '매트리스', qty: 1, unitFee: 3000, totalFee: 3000 },
]

export default function FeeResultPage() {
  const navigate = useNavigate()
  const totalFee = MOCK_ITEMS.reduce((s, i) => s + i.totalFee, 0)

  return (
    <div>
      <Header title="수수료 계산 결과" showBack showNotification />
      <div className="pt-14 p-4">
        {/* 총 수수료 */}
        <div className="mb-6 rounded-2xl bg-gray-50 p-5 text-center">
          <p className="text-sm text-gray-500">예상 수수료</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{totalFee.toLocaleString()}원</p>
          <p className="mt-1 text-xs text-gray-400">선택 품목 {MOCK_ITEMS.length}개</p>
        </div>

        {/* 상세 내역 */}
        <h3 className="mb-3 text-sm font-bold text-gray-900">상세 내역</h3>
        <div className="mb-6 rounded-2xl border border-gray-100 divide-y divide-gray-50">
          {MOCK_ITEMS.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-400">수량 {item.qty}개</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 line-through">{item.unitFee.toLocaleString()}원</p>
                <p className="text-sm font-bold text-gray-900">{item.totalFee.toLocaleString()}원</p>
              </div>
            </div>
          ))}
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
            className="flex-1 rounded-xl bg-gray-900 py-3.5 text-sm font-semibold text-white active:bg-gray-800"
          >
            홈으로
          </button>
        </div>

        {/* 온라인 신고 안내 */}
        <div className="rounded-2xl bg-gray-50 p-4">
          <p className="mb-2 text-xs text-gray-500">바로 온라인 신고(유료)로 진행할 수 있어요.</p>
          <button
            onClick={() => navigate('/online')}
            className="w-full rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white active:bg-gray-800"
          >
            온라인 신고(유료)로 진행
          </button>
        </div>
      </div>
    </div>
  )
}
