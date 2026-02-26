import { useNavigate } from 'react-router-dom'
import Header from '@/components/layout/Header'

const POPULAR_ITEMS = [
  '의자', '침대', '매트리스', '냉장고',
  '책상', '옷장', '소파', '전자레인지',
  '식탁', '선풍기',
]

export default function FeeCheckPage() {
  const navigate = useNavigate()

  return (
    <div>
      <Header title="수수료 조회" showBack showNotification />
      <div className="pt-14 p-4 space-y-6">
        {/* 수수료 조회 카드 */}
        <div className="rounded-2xl bg-gray-50 p-5">
          <h2 className="text-base font-bold text-gray-900">수수료 조회</h2>
          <p className="mt-1 text-sm text-gray-500">
            버리실 품목을 미리 검색해 예상 수수료를 확인해 보세요.
          </p>
          <button
            onClick={() => navigate('/fee-check/search')}
            className="mt-4 w-full rounded-xl bg-gray-900 py-3.5 text-sm font-semibold text-white active:bg-gray-800"
          >
            품목 검색하기
          </button>
        </div>

        {/* 자주 찾는 품목 */}
        <div>
          <h3 className="mb-3 text-sm font-bold text-gray-900">이웃들이 자주 찾는 품목</h3>
          <div className="flex flex-wrap gap-2">
            {POPULAR_ITEMS.map((item) => (
              <button
                key={item}
                onClick={() => navigate('/fee-check/search')}
                className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 active:bg-gray-50"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
