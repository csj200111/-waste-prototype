interface MapPlaceholderProps {
  className?: string;
}

export default function MapPlaceholder({ className = '' }: MapPlaceholderProps) {
  return (
    <div
      className={`
        flex aspect-video flex-col items-center justify-center
        rounded-xl bg-gray-100 border border-gray-200
        ${className}
      `}
    >
      {/* 지도 아이콘 */}
      <svg
        className="mb-3 h-12 w-12 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
        />
      </svg>
      <p className="text-sm text-gray-500 text-center px-4">
        추후 지도 API 연동 시 이 위치에 지도가 표시됩니다
      </p>
    </div>
  );
}
