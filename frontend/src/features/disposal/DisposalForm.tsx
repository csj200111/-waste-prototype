import { useState } from 'react';
import SearchBar from '@/components/ui/SearchBar';
import Input from '@/components/ui/Input';
import DatePicker from '@/components/ui/DatePicker';
import Button from '@/components/ui/Button';
import WasteItemCard from '@/components/waste/WasteItemCard';
import CategoryTree from '@/components/waste/CategoryTree';
import SizeSelector from '@/components/waste/SizeSelector';
import Modal from '@/components/ui/Modal';
import { wasteService } from '@/services/wasteService';
import { useDisposalStore } from '@/stores/useDisposalStore';
import { feeService } from '@/services/feeService';
import { regionService } from '@/services/regionService';
import type { Region } from '@/types/region';
import type { WasteItem } from '@/types/waste';

interface DisposalFormProps {
  onNext: () => void;
}

export default function DisposalForm({ onNext }: DisposalFormProps) {
  const store = useDisposalStore();

  const [regionQuery, setRegionQuery] = useState(
    store.region ? regionService.getRegionLabel(store.region) : '',
  );
  const [regionResults, setRegionResults] = useState<Region[]>([]);

  // 품목 추가 모달
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>();
  const [selectedItem, setSelectedItem] = useState<WasteItem | null>(null);
  const [selectedSizeId, setSelectedSizeId] = useState<string>();
  const [quantity, setQuantity] = useState(1);

  const categories = wasteService.getCategories();
  const today = new Date().toISOString().split('T')[0];

  const handleRegionSearch = (query: string) => {
    setRegionQuery(query);
    if (query.length >= 1) {
      setRegionResults(regionService.searchRegion(query).slice(0, 5));
    } else {
      setRegionResults([]);
    }
  };

  const handleRegionSelect = (region: Region) => {
    store.setRegion(region);
    setRegionQuery(regionService.getRegionLabel(region));
    setRegionResults([]);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    const items = wasteService.getItemsByCategory(categoryId);
    if (items.length === 1) {
      setSelectedItem(items[0]);
      setSelectedSizeId(undefined);
    }
  };

  const handleAddItem = () => {
    if (!store.region || !selectedItem || !selectedSizeId) return;

    const feeInfo = feeService.calculateFee(
      store.region.id,
      selectedItem.id,
      selectedSizeId,
    );
    const size = selectedItem.sizes.find((s) => s.id === selectedSizeId);
    if (!feeInfo || !size) return;

    store.addItem({
      wasteItemId: selectedItem.id,
      wasteItemName: selectedItem.name,
      sizeId: selectedSizeId,
      sizeLabel: size.label,
      quantity,
      fee: feeInfo.fee,
    });

    setShowAddModal(false);
    setSelectedItem(null);
    setSelectedSizeId(undefined);
    setSelectedCategoryId(undefined);
    setQuantity(1);
  };

  const isValid =
    store.region &&
    store.disposalAddress.trim() &&
    store.preferredDate &&
    store.items.length > 0;

  return (
    <div className="space-y-5">
      {/* 배출 지역 */}
      <section>
        <h3 className="text-sm font-bold text-gray-700 mb-2">배출 지역</h3>
        <SearchBar
          value={regionQuery}
          onChange={handleRegionSearch}
          placeholder="주소를 입력하세요"
        />
        {regionResults.length > 0 && !store.region && (
          <div className="mt-2 bg-white rounded-lg border border-gray-200 overflow-hidden">
            {regionResults.map((r) => (
              <button
                key={r.id}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 text-sm"
                onClick={() => handleRegionSelect(r)}
              >
                {regionService.getRegionLabel(r)}
              </button>
            ))}
          </div>
        )}
        {store.region && (
          <div className="mt-2 flex items-center justify-between">
            <p className="text-sm text-blue-600 font-medium">
              ✓ {regionService.getRegionLabel(store.region)}
            </p>
            <button
              type="button"
              className="text-xs text-gray-400 hover:text-gray-600"
              onClick={() => {
                store.setRegion(null);
                setRegionQuery('');
              }}
            >
              변경
            </button>
          </div>
        )}
      </section>

      {/* 배출 장소 */}
      <section>
        <Input
          label="배출 장소 (상세 주소)"
          placeholder="예: 역삼동 123-45 아파트 앞"
          value={store.disposalAddress}
          onChange={store.setDisposalAddress}
        />
      </section>

      {/* 희망 배출일 */}
      <section>
        <DatePicker
          label="희망 배출일"
          value={store.preferredDate}
          onChange={store.setPreferredDate}
          min={today}
        />
      </section>

      {/* 배출 품목 */}
      <section>
        <h3 className="text-sm font-bold text-gray-700 mb-2">배출 품목</h3>
        <div className="space-y-2">
          {store.items.map((item, index) => (
            <WasteItemCard
              key={index}
              itemName={item.wasteItemName}
              sizeLabel={item.sizeLabel}
              quantity={item.quantity}
              fee={item.fee * item.quantity}
              onRemove={() => store.removeItem(index)}
            />
          ))}
        </div>
        <Button
          variant="secondary"
          fullWidth
          onClick={() => setShowAddModal(true)}
        >
          + 품목 추가
        </Button>
      </section>

      {/* 총 수수료 */}
      {store.items.length > 0 && (
        <div className="rounded-xl bg-blue-50 p-4 text-center">
          <span className="text-sm text-gray-600">총 수수료: </span>
          <span className="text-xl font-bold text-blue-600">
            {store.getTotalFee().toLocaleString('ko-KR')}원
          </span>
        </div>
      )}

      {/* 다음 */}
      <Button fullWidth disabled={!isValid} onClick={onNext}>
        다음: 검수하기 →
      </Button>

      {/* 품목 추가 모달 */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="품목 추가"
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          <CategoryTree
            categories={categories}
            selectedId={selectedCategoryId}
            onSelect={handleCategorySelect}
          />

          {selectedItem && (
            <>
              <p className="text-sm font-medium text-blue-600">
                ✓ {selectedItem.name}
              </p>
              <SizeSelector
                sizes={selectedItem.sizes}
                selectedId={selectedSizeId}
                onSelect={setSelectedSizeId}
              />
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">수량:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-medium">{quantity}</span>
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
                    onClick={() => setQuantity((q) => q + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            </>
          )}

          <Button
            fullWidth
            disabled={!selectedItem || !selectedSizeId}
            onClick={handleAddItem}
          >
            추가하기
          </Button>
        </div>
      </Modal>
    </div>
  );
}
