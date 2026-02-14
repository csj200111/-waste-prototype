import { useDisposalStore } from '@/stores/useDisposalStore';
import { regionService } from '@/services/regionService';
import Button from '@/components/ui/Button';

interface ReviewSummaryProps {
  onBack: () => void;
  onConfirm: () => void;
}

export default function ReviewSummary({ onBack, onConfirm }: ReviewSummaryProps) {
  const store = useDisposalStore();

  if (!store.region) return null;

  return (
    <div className="space-y-5">
      {/* 배출 정보 */}
      <section>
        <h3 className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
          배출 정보
        </h3>
        <div className="space-y-2 rounded-xl bg-gray-50 p-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">지역</span>
            <span className="font-medium">{regionService.getRegionLabel(store.region)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">주소</span>
            <span className="font-medium">{store.disposalAddress}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">희망일</span>
            <span className="font-medium">{store.preferredDate}</span>
          </div>
        </div>
      </section>

      {/* 배출 품목 */}
      <section>
        <h3 className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
          배출 품목
        </h3>
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          {store.items.map((item, index) => (
            <div
              key={index}
              className="flex justify-between px-4 py-3 text-sm border-b border-gray-100 last:border-0"
            >
              <span>
                {index + 1}. {item.wasteItemName} ({item.sizeLabel}) x{item.quantity}
              </span>
              <span className="font-medium">
                {(item.fee * item.quantity).toLocaleString('ko-KR')}원
              </span>
            </div>
          ))}
          <div className="flex justify-between px-4 py-3 bg-gray-50 font-bold text-sm">
            <span>합계</span>
            <span className="text-blue-600">
              {store.getTotalFee().toLocaleString('ko-KR')}원
            </span>
          </div>
        </div>
      </section>

      {/* 안내 */}
      <div className="rounded-xl bg-yellow-50 p-4 text-sm text-yellow-800">
        위 내용이 정확한지 다시 한번 확인해주세요.
      </div>

      {/* 버튼 */}
      <div className="flex gap-3">
        <Button variant="secondary" fullWidth onClick={onBack}>
          ← 수정하기
        </Button>
        <Button fullWidth onClick={onConfirm}>
          결제하기 →
        </Button>
      </div>
    </div>
  );
}
