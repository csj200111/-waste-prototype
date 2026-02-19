import type { FeeInfo } from '@/types/fee';

interface SizeSelectorProps {
  fees: FeeInfo[];
  selected?: FeeInfo;
  onSelect: (fee: FeeInfo) => void;
}

export default function SizeSelector({ fees, selected, onSelect }: SizeSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      {fees.map((feeInfo, index) => {
        const isSelected =
          selected != null &&
          selected.wasteStandard === feeInfo.wasteStandard &&
          selected.fee === feeInfo.fee;
        const label = feeInfo.wasteStandard ?? '기본';
        const feeAmount = feeInfo.fee;

        return (
          <button
            key={index}
            type="button"
            onClick={() => onSelect(feeInfo)}
            className={`
              flex items-center gap-3 rounded-xl border p-4 min-h-[44px]
              text-left transition-colors duration-150
              ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }
            `}
          >
            <div
              className={`
                flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2
                ${isSelected ? 'border-blue-600' : 'border-gray-300'}
              `}
            >
              {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-blue-600" />}
            </div>
            <div className="flex flex-col gap-0.5">
              <span
                className={`text-sm font-medium ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}
              >
                {label}
              </span>
              <span className="text-xs text-gray-500">
                {feeInfo.feeType === '무료'
                  ? '무료'
                  : feeAmount != null
                    ? `${feeAmount.toLocaleString('ko-KR')}원`
                    : '정보 없음'}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
