import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Header from '@/components/layout/Header'
import SearchBar from '@/components/ui/SearchBar'
import CategoryTree from '@/components/waste/CategoryTree'
import SizeSelector from '@/components/waste/SizeSelector'
import FeeResultCard from '@/components/waste/FeeResultCard'
import Button from '@/components/ui/Button'
import { regionService } from '@/services/regionService'
import { wasteService } from '@/services/wasteService'
import { feeService } from '@/services/feeService'
import type { WasteItem } from '@/types/waste'
import type { FeeInfo } from '@/types/fee'

export default function FeeCheckPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialWasteName = searchParams.get('wasteName') || ''

  // Region
  const [sidoList, setSidoList] = useState<string[]>([])
  const [sigunguList, setSigunguList] = useState<string[]>([])
  const [selectedSido, setSelectedSido] = useState('')
  const [selectedSigungu, setSelectedSigungu] = useState('')

  // Waste
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()
  const [keyword, setKeyword] = useState(initialWasteName)
  const [searchResults, setSearchResults] = useState<WasteItem[]>([])
  const [selectedItem, setSelectedItem] = useState<WasteItem | null>(null)

  // Fee
  const [fees, setFees] = useState<FeeInfo[]>([])
  const [selectedFee, setSelectedFee] = useState<FeeInfo | undefined>()

  // Load sido list & categories on mount
  useEffect(() => {
    regionService.getSido().then(setSidoList)
    wasteService.getCategories().then(setCategories)
  }, [])

  // Load sigungu when sido changes
  const handleSidoChange = (sido: string) => {
    setSelectedSido(sido)
    setSelectedSigungu('')
    setSelectedItem(null)
    setFees([])
    setSelectedFee(undefined)
    if (sido) {
      regionService.getSigungu(sido).then(setSigunguList)
    } else {
      setSigunguList([])
    }
  }

  const handleSigunguChange = (sigungu: string) => {
    setSelectedSigungu(sigungu)
    setSelectedItem(null)
    setFees([])
    setSelectedFee(undefined)
  }

  // Search waste items
  useEffect(() => {
    if (!selectedSigungu || keyword.length < 1) {
      setSearchResults([])
      return
    }
    wasteService.getItems({ sigungu: selectedSigungu, category: selectedCategory, keyword }).then(setSearchResults)
  }, [selectedSigungu, selectedCategory, keyword])

  // Load fees when item selected
  useEffect(() => {
    if (!selectedItem || !selectedSigungu || !selectedSido) {
      setFees([])
      setSelectedFee(undefined)
      return
    }
    feeService
      .getFees({ sido: selectedSido, sigungu: selectedSigungu, wasteName: selectedItem.wasteName })
      .then((result) => {
        setFees(result)
        if (result.length === 1) setSelectedFee(result[0])
        else setSelectedFee(undefined)
      })
  }, [selectedItem, selectedSido, selectedSigungu])

  const handleSearchItemSelect = (item: WasteItem) => {
    setSelectedItem(item)
    setKeyword('')
    setSearchResults([])
    setSelectedFee(undefined)
  }

  const handleCategorySelect = (cat: string | undefined) => {
    setSelectedCategory(cat)
    setSelectedItem(null)
    setFees([])
    setSelectedFee(undefined)
  }

  return (
    <div>
      <Header title="수수료 조회" showBack onBack={() => navigate(-1)} />
      <div className="p-4 pt-18 space-y-6">

        {/* Step 1: 지역 선택 */}
        <section>
          <h2 className="font-bold text-sm text-gray-700 mb-2">Step 1. 지역 선택</h2>
          <div className="flex gap-2">
            <select
              className="flex-1 border border-gray-300 rounded-lg px-3 py-3 text-sm bg-white"
              value={selectedSido}
              onChange={(e) => handleSidoChange(e.target.value)}
            >
              <option value="">시/도 선택</option>
              {sidoList.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select
              className="flex-1 border border-gray-300 rounded-lg px-3 py-3 text-sm bg-white"
              value={selectedSigungu}
              onChange={(e) => handleSigunguChange(e.target.value)}
              disabled={!selectedSido}
            >
              <option value="">시/군/구 선택</option>
              {sigunguList.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          {selectedSigungu && (
            <p className="mt-2 text-sm text-blue-600 font-medium">
              ✓ {selectedSido} {selectedSigungu}
            </p>
          )}
        </section>

        {/* Step 2: 폐기물 선택 */}
        {selectedSigungu && (
          <section>
            <h2 className="font-bold text-sm text-gray-700 mb-2">Step 2. 폐기물 선택</h2>
            <SearchBar
              value={keyword}
              onChange={setKeyword}
              placeholder="폐기물 검색... (예: 책상, 냉장고)"
            />
            {searchResults.length > 0 && (
              <div className="mt-2 bg-white rounded-lg border border-gray-200 overflow-hidden">
                {searchResults.map((item, i) => (
                  <button
                    key={i}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 text-sm"
                    onClick={() => handleSearchItemSelect(item)}
                  >
                    {item.wasteName}
                    <span className="text-xs text-gray-400 ml-2">{item.wasteCategory}</span>
                  </button>
                ))}
              </div>
            )}
            <div className="mt-3">
              <CategoryTree
                categories={categories}
                selected={selectedCategory}
                onSelect={handleCategorySelect}
              />
            </div>
            {selectedItem && (
              <p className="mt-2 text-sm text-blue-600 font-medium">
                ✓ {selectedItem.wasteName}
              </p>
            )}
          </section>
        )}

        {/* Step 3: 규격 선택 */}
        {selectedItem && fees.length > 0 && (
          <section>
            <h2 className="font-bold text-sm text-gray-700 mb-2">Step 3. 규격 선택</h2>
            <SizeSelector
              fees={fees}
              selected={selectedFee}
              onSelect={setSelectedFee}
            />
          </section>
        )}

        {/* 결과 */}
        {selectedFee && selectedItem && (
          <section>
            <FeeResultCard
              fee={selectedFee.fee ?? 0}
              itemName={selectedItem.wasteName}
              sizeName={selectedFee.wasteStandard ?? '기본'}
              regionName={`${selectedSigungu} 기준`}
            />
            <div className="mt-4">
              <Button fullWidth onClick={() => navigate('/online/apply')}>
                온라인으로 바로 신청하기 →
              </Button>
            </div>
          </section>
        )}

      </div>
    </div>
  )
}
