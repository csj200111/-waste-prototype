interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = '검색어를 입력하세요',
}: SearchBarProps) {
  return (
    <div className="relative flex items-center">
      {/* 검색 아이콘 */}
      <svg
        className="absolute left-3 h-5 w-5 text-gray-400 pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full rounded-lg border border-gray-300 bg-white
          py-2.5 pl-10 pr-10 text-base min-h-[44px]
          outline-none transition-colors duration-150
          placeholder:text-gray-400
          focus:border-blue-500 focus:ring-1 focus:ring-blue-500
        "
      />

      {/* 지우기 버튼 */}
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-3 flex h-5 w-5 items-center justify-center rounded-full bg-gray-300 text-white hover:bg-gray-400 transition-colors duration-150"
        >
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
