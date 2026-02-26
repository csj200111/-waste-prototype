import { useState } from 'react'
import Header from '@/components/layout/Header'

const CATEGORIES = ['전체', '처리 업체', '지정 판매소', '재활용 센터']

const MOCK_FACILITIES = [
  { name: '강남구 대형폐기물 처리장', address: '서울 강남구 역삼로 123', hours: '09:00 - 18:00', distance: '1.2km' },
  { name: 'CU 역삼행복점 (지정 판매소)', address: '서울 강남구 테헤란로 456', hours: '24시간 영업', distance: '350m' },
  { name: '서초 재활용 센터', address: '서울 서초구 반포대로 78', hours: '09:00 - 17:00 (월~금)', distance: '2.5km' },
]

export default function MapSearchPage() {
  const [activeCategory, setActiveCategory] = useState('전체')

  return (
    <div>
      <Header title="지도 검색" showBack showNotification />
      <div className="pt-14">
        {/* 검색 바 */}
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center gap-2 rounded-xl bg-gray-100 px-3 py-2.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="지역, 시설, 판매소 검색"
              className="flex-1 bg-transparent text-sm outline-none placeholder-gray-400"
            />
          </div>
        </div>

        {/* 카테고리 */}
        <div className="flex gap-2 overflow-x-auto px-4 py-2 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium ${
                activeCategory === cat ? 'bg-gray-900 text-white' : 'border border-gray-200 text-gray-500'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 지도 영역 */}
        <div className="flex h-56 items-center justify-center bg-gray-100">
          <span className="text-gray-400 text-sm">지도 영역 (Kakao/Naver Map)</span>
        </div>

        {/* 주변 시설 목록 */}
        <div className="p-4">
          <h3 className="mb-3 text-sm font-bold text-gray-900">주변 시설 {MOCK_FACILITIES.length}곳</h3>
          <div className="space-y-4">
            {MOCK_FACILITIES.map((f, i) => (
              <div key={i} className="border-b border-gray-50 pb-4 last:border-0">
                <div className="flex items-start justify-between">
                  <p className="text-sm font-medium text-gray-900">{f.name}</p>
                  <span className="shrink-0 text-sm font-bold text-gray-900">{f.distance}</span>
                </div>
                <p className="mt-0.5 text-xs text-gray-400">{f.address}</p>
                <p className="text-xs text-gray-400">{f.hours}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
