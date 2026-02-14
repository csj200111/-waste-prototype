interface WasteItemCardProps {
  itemName: string;
  sizeLabel: string;
  quantity: number;
  fee: number;
  onRemove?: () => void;
}

export default function WasteItemCard({
  itemName,
  sizeLabel,
  quantity,
  fee,
  onRemove,
}: WasteItemCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
      <div className="flex flex-1 flex-col gap-1 min-w-0">
        <span className="text-sm font-bold text-gray-900 truncate">
          {itemName}
        </span>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>{sizeLabel}</span>
          <span className="text-gray-300">|</span>
          <span>{quantity}개</span>
        </div>
      </div>

      <span className="shrink-0 text-sm font-semibold text-blue-600">
        {fee.toLocaleString('ko-KR')}원
      </span>

      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors duration-150"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
