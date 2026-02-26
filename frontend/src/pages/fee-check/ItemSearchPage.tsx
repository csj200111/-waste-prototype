import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Header from '@/components/layout/Header'

const CATEGORIES = ['전체', '가구류', '가전류', '주방용품', '기타']

const MOCK_ITEMS = [
  { id: 1, name: '의자 (일반/등받이 부착)', fee: 2000, added: true },
  { id: 2, name: '의자 (회전/바퀴 부착)', fee: 3000, added: true },
  { id: 3, name: '책상 (편수/서랍 부착)', fee: 4000, added: false },
  { id: 4, name: '책상 (양수/서랍 양쪽)', fee: 5000, added: false },
  { id: 5, name: '식탁 (4인용 이하)', fee: 4000, added: false },
]

export default function ItemSearchPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const isOnline = location.pathname.startsWith('/online')
  const basePath = isOnline ? '/online' : '/fee-check'

  const [activeCategory, setActiveCategory] = useState('전체')
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set([1, 2]))

  const toggleItem = (id: number) => {
    setSelectedItems((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const totalFee = MOCK_ITEMS.filter((i) => selectedItems.has(i.id)).reduce((sum, i) => sum + i.fee, 0)

  return (
    <div>
      <Header title="품목 검색" showBack showNotification />
      <div className="pt-14 flex flex-col" style={{ height: 'calc(100vh - 56px - 64px)' }}>
        {/* 검색 바 */}
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center gap-2 rounded-xl bg-gray-100 px-3 py-2.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="품목 검색"
              className="flex-1 bg-transparent text-sm outline-none placeholder-gray-400"
            />
          </div>
        </div>

        {/* 카테고리 탭 */}
        <div className="flex gap-2 overflow-x-auto px-4 py-2 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium ${
                activeCategory === cat
                  ? 'bg-gray-900 text-white'
                  : 'border border-gray-200 text-gray-500'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 품목 목록 */}
        <div className="flex-1 overflow-y-auto">
          <div className="divide-y divide-gray-50">
            {MOCK_ITEMS.map((item) => {
              const isSelected = selectedItems.has(item.id)
              return (
                <div key={item.id} className="flex items-center justify-between px-4 py-4">
                  <div>
                    <p className="text-sm text-gray-900">{item.name}</p>
                    <p className="mt-0.5 text-xs text-gray-400">{item.fee.toLocaleString()}원</p>
                  </div>
                  <button
                    onClick={() => toggleItem(item.id)}
                    className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium ${
                      isSelected
                        ? 'bg-gray-100 text-gray-700'
                        : 'border border-gray-200 text-gray-500'
                    }`}
                  >
                    {isSelected ? '✓ 추가됨' : '+ 추가'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* 하단 바 */}
        <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">선택 {selectedItems.size}개</p>
            <p className="text-base font-bold text-gray-900">{totalFee.toLocaleString()}원</p>
          </div>
          <button
            onClick={() => navigate(`${basePath}/confirm`)}
            className="rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white active:bg-gray-800"
          >
            선택 확인
          </button>
        </div>
      </div>
    </div>
  )
}
