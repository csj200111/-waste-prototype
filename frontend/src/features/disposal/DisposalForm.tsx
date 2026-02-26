import { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import DatePicker from '@/components/ui/DatePicker';
import Button from '@/components/ui/Button';
import WasteItemCard from '@/components/waste/WasteItemCard';
import CategoryTree from '@/components/waste/CategoryTree';
import SizeSelector from '@/components/waste/SizeSelector';
import WasteSearchBar from '@/components/waste/WasteSearchBar';
import Modal from '@/components/ui/Modal';
import { regionService } from '@/services/regionService';
import { wasteService } from '@/services/wasteService';
import { feeService } from '@/services/feeService';
import { useDisposalStore } from '@/stores/useDisposalStore';
import type { WasteItem } from '@/types/waste';
import type { FeeInfo } from '@/types/fee';

interface DisposalFormProps {
  onNext: () => void;
}

export default function DisposalForm({ onNext }: DisposalFormProps) {
  const store = useDisposalStore();

  // Region dropdowns
  const [sidoList, setSidoList] = useState<string[]>([]);
  const [sigunguList, setSigunguList] = useState<string[]>([]);
  const [selectedSido, setSelectedSido] = useState(store.region?.sido ?? '');
  const [selectedSigungu, setSelectedSigungu] = useState(store.region?.sigungu ?? '');

  // Item add modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [selectedItem, setSelectedItem] = useState<WasteItem | null>(null);
  const [fees, setFees] = useState<FeeInfo[]>([]);
  const [selectedFee, setSelectedFee] = useState<FeeInfo | null>(null);
  const [quantity, setQuantity] = useState(1);

  const today = new Date().toISOString().split('T')[0];

  // Load sido list & restore sigungu list if region already set
  useEffect(() => {
    regionService.getSido().then(setSidoList);
    if (store.region?.sido) {
      regionService.getSigungu(store.region.sido).then(setSigunguList);
    }
  }, []);

  // Load categories
  useEffect(() => {
    wasteService.getCategories().then(setCategories);
  }, []);

  // Load fee options when item selected
  useEffect(() => {
    if (!selectedItem || !store.region) {
      setFees([]);
      setSelectedFee(null);
      return;
    }
    feeService
      .getFees({
        sido: store.region.sido,
        sigungu: store.region.sigungu,
        wasteName: selectedItem.wasteName,
      })
      .then((result) => {
        setFees(result);
        if (result.length === 1) setSelectedFee(result[0]);
        else setSelectedFee(null);
      });
  }, [selectedItem, store.region]);

  const handleSidoChange = (sido: string) => {
    setSelectedSido(sido);
    setSelectedSigungu('');
    store.setRegion(null);
    if (sido) {
      regionService.getSigungu(sido).then(setSigunguList);
    } else {
      setSigunguList([]);
    }
  };

  const handleSigunguChange = (sigungu: string) => {
    setSelectedSigungu(sigungu);
    if (selectedSido && sigungu) {
      store.setRegion({ sido: selectedSido, sigungu });
    } else {
      store.setRegion(null);
    }
  };

  const handleItemSelect = (item: WasteItem) => {
    setSelectedItem(item);
    setSelectedFee(null);
  };

  const handleAddItem = () => {
    if (!store.region || !selectedItem || !selectedFee) return;

    store.addItem({
      wasteItemName: selectedItem.wasteName,
      sizeLabel: selectedFee.wasteStandard ?? '기본',
      quantity,
      fee: selectedFee.fee ?? 0,
    });

    setShowAddModal(false);
    setSelectedItem(null);
    setSelectedFee(null);
    setSelectedCategory(undefined);
    setQuantity(1);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setSelectedItem(null);
    setSelectedFee(null);
    setSelectedCategory(undefined);
    setQuantity(1);
  };

  const isValid =
    store.region && store.disposalAddress.trim() && store.preferredDate && store.items.length > 0;

  return (
    <div className="space-y-5">
      {/* 배출 지역 */}
      <section>
        <h3 className="text-sm font-bold text-gray-700 mb-2">배출 지역</h3>
        <div className="flex gap-2">
          <select
            className="flex-1 border border-gray-300 rounded-lg px-3 py-3 text-sm bg-white"
            value={selectedSido}
            onChange={(e) => handleSidoChange(e.target.value)}
          >
            <option value="">시/도 선택</option>
            {sidoList.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
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
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        {store.region && (
          <p className="mt-2 text-sm text-blue-600 font-medium">
            ✓ {store.region.sido} {store.region.sigungu}
          </p>
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
          disabled={!store.region}
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
      <Modal isOpen={showAddModal} onClose={closeModal} title="품목 추가">
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          <CategoryTree
            categories={categories}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />

          <WasteSearchBar
            sigungu={store.region?.sigungu ?? ''}
            category={selectedCategory}
            onSelect={handleItemSelect}
          />

          {selectedItem && (
            <>
              <p className="text-sm font-medium text-blue-600">✓ {selectedItem.wasteName}</p>
              {fees.length > 0 ? (
                <SizeSelector
                  fees={fees}
                  selected={selectedFee ?? undefined}
                  onSelect={setSelectedFee}
                />
              ) : (
                <p className="text-sm text-gray-400">해당 품목의 수수료 정보가 없습니다</p>
              )}
              {selectedFee && (
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
              )}
            </>
          )}

          <Button fullWidth disabled={!selectedItem || !selectedFee} onClick={handleAddItem}>
            추가하기
          </Button>
        </div>
      </Modal>
    </div>
  );
}
