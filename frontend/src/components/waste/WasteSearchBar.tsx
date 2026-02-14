import { useState, useMemo } from 'react';
import SearchBar from '@/components/ui/SearchBar';
import { wasteService } from '@/services/wasteService';
import type { WasteItem } from '@/types/waste';

interface WasteSearchBarProps {
  onSelect: (item: WasteItem) => void;
}

export default function WasteSearchBar({ onSelect }: WasteSearchBarProps) {
  const [keyword, setKeyword] = useState('');

  const results = useMemo(() => {
    if (keyword.length < 1) return [];
    return wasteService.searchWasteItems(keyword);
  }, [keyword]);

  const handleSelect = (item: WasteItem) => {
    onSelect(item);
    setKeyword('');
  };

  return (
    <div>
      <SearchBar
        value={keyword}
        onChange={setKeyword}
        placeholder="폐기물 검색... (예: 책상, 냉장고)"
      />
      {results.length > 0 && (
        <div className="mt-2 bg-white rounded-lg border border-gray-200 overflow-hidden">
          {results.map((item) => (
            <button
              key={item.id}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 text-sm"
              onClick={() => handleSelect(item)}
            >
              {item.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
