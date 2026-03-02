import { useState, useEffect } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import Header from '@/components/layout/Header'
import { useLocationStore } from '@/stores/useLocationStore'
import { wasteService } from '@/services/wasteService'
import { feeService } from '@/services/feeService'
import type { WasteItem } from '@/types/waste'
import type { FeeInfo } from '@/types/fee'

export interface SelectedFeeItem {
  wasteName: string
  wasteCategory: string
  wasteStandard: string
  fee: number
  qty: number
}

export default function ItemSearchPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const isOnline = location.pathname.startsWith('/online')
  const basePath = isOnline ? '/online' : '/fee-check'

  const loc = useLocationStore((s) => s.currentLocation)
  const sido = loc?.sido || ''
  const sigungu = loc?.sigungu || ''

  const [categories, setCategories] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState('전체')
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '')
  const [items, setItems] = useState<WasteItem[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedItems, setSelectedItems] = useState<SelectedFeeItem[]>([])
  const [addingItem, setAddingItem] = useState<string | null>(null)

  // 규격 선택 모달 상태
  const [feeOptions, setFeeOptions] = useState<FeeInfo[]>([])
  const [showFeeModal, setShowFeeModal] = useState(false)

  // 카테고리 로드
  useEffect(() => {
    wasteService.getCategories().then((cats) => setCategories(['전체', ...cats]))
  }, [])

  // 아이템 검색
  useEffect(() => {
    if (!sigungu) return
    setLoading(true)
    const category = activeCategory === '전체' ? undefined : activeCategory
    wasteService
      .getItems({ sido, sigungu, category, keyword: keyword || undefined })
      .then(setItems)
      .finally(() => setLoading(false))
  }, [sigungu, activeCategory, keyword])

  // 초기 키워드가 있으면 자동 검색
  useEffect(() => {
    const kw = searchParams.get('keyword')
    if (kw) setKeyword(kw)
  }, [searchParams])

  const handleAddItem = async (item: WasteItem) => {
    // 이미 추가된 항목인지 확인 → 토글 해제
    if (selectedItems.some((s) => s.wasteName === item.wasteName)) {
      setSelectedItems((prev) => prev.filter((s) => s.wasteName !== item.wasteName))
      return
    }

    // 중복 클릭 방지
    if (addingItem) return
    setAddingItem(item.wasteName)

    try {
      // 수수료 조회
      const fees = await feeService.getFees({ sido, sigungu, wasteName: item.wasteName })

      if (fees.length === 0) {
        alert('해당 품목의 수수료 정보를 찾을 수 없습니다.')
        return
      }

      if (fees.length === 1) {
        // 단일 규격 → 바로 추가
        const f = fees[0]
        setSelectedItems((prev) => [
          ...prev,
          {
            wasteName: f.wasteName,
            wasteCategory: f.wasteCategory,
            wasteStandard: f.wasteStandard || '',
            fee: f.fee || 0,
            qty: 1,
          },
        ])
      } else {
        // 복수 규격 → 선택 모달
        setFeeOptions(fees)
        setShowFeeModal(true)
      }
    } catch (err) {
      console.error('수수료 조회 실패:', err)
      alert('수수료 조회에 실패했습니다. 백엔드 서버가 실행 중인지 확인해 주세요.')
    } finally {
      setAddingItem(null)
    }
  }

  const handleSelectFeeOption = (f: FeeInfo) => {
    setSelectedItems((prev) => [
      ...prev,
      {
        wasteName: f.wasteName,
        wasteCategory: f.wasteCategory,
        wasteStandard: f.wasteStandard || '',
        fee: f.fee || 0,
        qty: 1,
      },
    ])
    setShowFeeModal(false)
    setFeeOptions([])
  }

  const totalFee = selectedItems.reduce((sum, i) => sum + i.fee * i.qty, 0)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      // keyword state가 이미 업데이트되어 있으므로 useEffect에서 검색 실행됨
    }
  }

  if (!sigungu) {
    return (
      <div>
        <Header title="품목 검색" showBack showNotification />
        <div className="pt-14 p-4">
          <div className="rounded-2xl bg-amber-50 p-6 text-center">
            <p className="text-sm font-medium text-amber-800 mb-2">지역 설정이 필요합니다</p>
            <p className="text-xs text-amber-600 mb-4">수수료는 지역마다 다릅니다. 먼저 지역을 설정해 주세요.</p>
            <button
              onClick={() => navigate('/location/auto')}
              className="rounded-xl bg-amber-600 px-6 py-2.5 text-sm font-semibold text-white"
            >
              지역 설정하기
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header title="품목 검색" showBack showNotification />
      <div className="pt-14 flex flex-col" style={{ height: 'calc(100vh - 56px - 64px)' }}>
        {/* 지역 표시 */}
        <div className="px-4 pt-2 pb-1">
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            {sido} {sigungu}
          </span>
        </div>

        {/* 검색 바 */}
        <div className="px-4 pt-2 pb-2">
          <div className="flex items-center gap-2 rounded-xl bg-gray-100 px-3 py-2.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="품목 검색 (예: 소파, 냉장고)"
              className="flex-1 bg-transparent text-sm outline-none placeholder-gray-400"
            />
            {keyword && (
              <button onClick={() => setKeyword('')} className="text-gray-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
                </svg>
              </button>
            )}
          </div>
          <button
            onClick={() => navigate('/ai/predict')}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 py-2.5 text-sm font-medium text-blue-600 active:bg-blue-100"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a4 4 0 014 4v1a1 1 0 001 1h1a4 4 0 010 8h-1a1 1 0 00-1 1v1a4 4 0 01-8 0v-1a1 1 0 00-1-1H6a4 4 0 010-8h1a1 1 0 001-1V6a4 4 0 014-4z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            AI 판독하기
          </button>
        </div>

        {/* 카테고리 탭 */}
        <div className="flex gap-2 overflow-x-auto px-4 py-2 scrollbar-hide">
          {categories.map((cat) => (
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
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-12">검색 중...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-12">검색 결과가 없습니다</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {items.map((item) => {
                const selected = selectedItems.find((s) => s.wasteName === item.wasteName)
                const isAdding = addingItem === item.wasteName
                return (
                  <div
                    key={item.wasteName}
                    onClick={() => !isAdding && handleAddItem(item)}
                    className={`flex items-center justify-between px-4 py-4 cursor-pointer active:bg-gray-50 ${
                      selected ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${selected ? 'font-medium text-blue-700' : 'text-gray-900'}`}>
                        {item.wasteName}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-400">{item.wasteCategory}</p>
                      {selected && (
                        <p className="mt-0.5 text-xs text-blue-600">
                          {selected.wasteStandard && `${selected.wasteStandard} · `}
                          {selected.fee.toLocaleString()}원
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 ml-3">
                      {isAdding ? (
                        <span className="text-xs text-gray-400">조회 중...</span>
                      ) : selected ? (
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <circle cx="10" cy="10" r="10" fill="#3B82F6"/>
                          <path d="M6 10l2.5 2.5L14 7.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <circle cx="10" cy="10" r="9.5" stroke="#D1D5DB"/>
                        </svg>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* 하단 바 */}
        <div className="border-t border-gray-100 px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">선택 {selectedItems.length}개</p>
              <p className="text-base font-bold text-gray-900">{totalFee.toLocaleString()}원</p>
            </div>
            <button
              onClick={() =>
                navigate(`${basePath}/confirm`, { state: { selectedItems } })
              }
              disabled={selectedItems.length === 0}
              className={`rounded-xl px-6 py-3 text-sm font-semibold text-white ${
                selectedItems.length > 0
                  ? 'bg-blue-600 active:bg-blue-700'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              선택 확인
            </button>
          </div>
        </div>
      </div>

      {/* 규격 선택 모달 */}
      {showFeeModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
          <div className="w-full max-w-[428px] rounded-t-2xl bg-white p-4 pb-8">
            <h3 className="text-base font-bold text-gray-900 mb-3">규격을 선택하세요</h3>
            <div className="space-y-2">
              {feeOptions.map((f, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectFeeOption(f)}
                  className="w-full flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 active:bg-gray-50"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{f.wasteStandard || '기본'}</p>
                    <p className="text-xs text-gray-400">{f.wasteName}</p>
                  </div>
                  <p className="text-sm font-bold text-blue-600">{(f.fee || 0).toLocaleString()}원</p>
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setShowFeeModal(false)
                setFeeOptions([])
              }}
              className="mt-3 w-full rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-500"
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
