import type { WasteSize } from '@/types/waste';

interface SizeSelectorProps {
  sizes: WasteSize[];
  selectedId?: string;
  onSelect: (sizeId: string) => void;
}

export default function SizeSelector({
  sizes,
  selectedId,
  onSelect,
}: SizeSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      {sizes.map((size) => {
        const isSelected = size.id === selectedId;
        return (
          <button
            key={size.id}
            type="button"
            onClick={() => onSelect(size.id)}
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
            {/* 라디오 버튼 */}
            <div
              className={`
                flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2
                ${isSelected ? 'border-blue-600' : 'border-gray-300'}
              `}
            >
              {isSelected && (
                <div className="h-2.5 w-2.5 rounded-full bg-blue-600" />
              )}
            </div>

            <div className="flex flex-col gap-0.5">
              <span
                className={`text-sm font-medium ${
                  isSelected ? 'text-blue-700' : 'text-gray-900'
                }`}
              >
                {size.label}
              </span>
              {size.description && (
                <span className="text-xs text-gray-500">{size.description}</span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
