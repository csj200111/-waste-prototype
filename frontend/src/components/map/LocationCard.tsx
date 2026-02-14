interface LocationCardProps {
  name: string;
  address: string;
  phone?: string;
  onClick?: () => void;
}

export default function LocationCard({
  name,
  address,
  phone,
  onClick,
}: LocationCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm
        ${onClick ? 'cursor-pointer active:bg-gray-50 transition-colors duration-150' : ''}
      `}
    >
      {/* 위치 핀 아이콘 */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50">
        <svg
          className="h-5 w-5 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </div>

      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-base font-bold text-gray-900 truncate">{name}</span>
        <span className="text-sm text-gray-500">{address}</span>
        {phone && (
          <span className="text-sm text-blue-600">{phone}</span>
        )}
      </div>
    </div>
  );
}
