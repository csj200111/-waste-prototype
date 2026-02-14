import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '@/components/layout/Header'
import SearchBar from '@/components/ui/SearchBar'
import CategoryTree from '@/components/waste/CategoryTree'
import SizeSelector from '@/components/waste/SizeSelector'
import FeeResultCard from '@/components/waste/FeeResultCard'
import Button from '@/components/ui/Button'
import { regionService } from '@/services/regionService'
import { wasteService } from '@/services/wasteService'
import { feeService } from '@/services/feeService'
import type { Region } from '@/types/region'
import type { WasteItem } from '@/types/waste'

export default function FeeCheckPage() {
  const navigate = useNavigate()
  const [regionQuery, setRegionQuery] = useState('')
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>()
  const [selectedItem, setSelectedItem] = useState<WasteItem | null>(null)
  const [selectedSizeId, setSelectedSizeId] = useState<string | undefined>()
  const [searchKeyword, setSearchKeyword] = useState('')

  const categories = wasteService.getCategories()

  const regionResults = useMemo(() => {
    if (regionQuery.length < 1) return []
    return regionService.searchRegion(regionQuery).slice(0, 5)
  }, [regionQuery])

  const searchResults = useMemo(() => {
    if (searchKeyword.length < 1) return []
    return wasteService.searchWasteItems(searchKeyword)
  }, [searchKeyword])

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId)
    const items = wasteService.getItemsByCategory(categoryId)
    if (items.length === 1) {
      setSelectedItem(items[0])
      setSelectedSizeId(undefined)
    } else if (items.length > 1) {
      setSelectedItem(null)
      setSelectedSizeId(undefined)
    }
  }

  const handleSearchItemSelect = (item: WasteItem) => {
    setSelectedItem(item)
    setSelectedSizeId(undefined)
    setSearchKeyword('')
  }

  const fee = useMemo(() => {
    if (!selectedRegion || !selectedItem || !selectedSizeId) return null
    return feeService.calculateFee(selectedRegion.id, selectedItem.id, selectedSizeId)
  }, [selectedRegion, selectedItem, selectedSizeId])

  return (
    <div>
      <Header title="수수료 조회" showBack onBack={() => navigate(-1)} />
      <div className="p-4 pt-18 space-y-6">
        {/* Step 1: 지역 선택 */}
        <section>
          <h2 className="font-bold text-sm text-gray-700 mb-2">Step 1. 지역 선택</h2>
          <SearchBar
            value={regionQuery}
            onChange={setRegionQuery}
            placeholder="주소를 입력하세요 (예: 강남구 역삼동)"
          />
          {regionResults.length > 0 && !selectedRegion && (
            <div className="mt-2 bg-white rounded-lg border border-gray-200 overflow-hidden">
              {regionResults.map((r) => (
                <button
                  key={r.id}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 text-sm"
                  onClick={() => {
                    setSelectedRegion(r)
                    setRegionQuery(regionService.getRegionLabel(r))
                  }}
                >
                  {regionService.getRegionLabel(r)}
                </button>
              ))}
            </div>
          )}
          {selectedRegion && (
            <p className="mt-2 text-sm text-primary font-medium">
              ✓ {regionService.getRegionLabel(selectedRegion)}
            </p>
          )}
        </section>

        {/* Step 2: 폐기물 선택 */}
        <section>
          <h2 className="font-bold text-sm text-gray-700 mb-2">Step 2. 폐기물 선택</h2>
          <SearchBar
            value={searchKeyword}
            onChange={setSearchKeyword}
            placeholder="폐기물 검색... (예: 책상, 냉장고)"
          />
          {searchResults.length > 0 && (
            <div className="mt-2 bg-white rounded-lg border border-gray-200 overflow-hidden">
              {searchResults.map((item) => (
                <button
                  key={item.id}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 text-sm"
                  onClick={() => handleSearchItemSelect(item)}
                >
                  {item.name}
                </button>
              ))}
            </div>
          )}
          <div className="mt-3">
            <CategoryTree
              categories={categories}
              selectedId={selectedCategoryId}
              onSelect={handleCategorySelect}
            />
          </div>
          {selectedItem && (
            <p className="mt-2 text-sm text-primary font-medium">
              ✓ {selectedItem.name}
            </p>
          )}
        </section>

        {/* Step 3: 규격 선택 */}
        {selectedItem && (
          <section>
            <h2 className="font-bold text-sm text-gray-700 mb-2">Step 3. 규격 선택</h2>
            <SizeSelector
              sizes={selectedItem.sizes}
              selectedId={selectedSizeId}
              onSelect={setSelectedSizeId}
            />
          </section>
        )}

        {/* 결과 */}
        {fee && selectedItem && selectedSizeId && selectedRegion && (
          <section>
            <FeeResultCard
              fee={fee.fee}
              itemName={selectedItem.name}
              sizeName={selectedItem.sizes.find((s) => s.id === selectedSizeId)?.label ?? ''}
              regionName={`${selectedRegion.district} 기준`}
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
