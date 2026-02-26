import { useState, useEffect } from 'react';
import SearchBar from '@/components/ui/SearchBar';
import { wasteService } from '@/services/wasteService';
import type { WasteItem } from '@/types/waste';

interface WasteSearchBarProps {
  sigungu: string;
  category?: string;
  onSelect: (item: WasteItem) => void;
}

export default function WasteSearchBar({ sigungu, category, onSelect }: WasteSearchBarProps) {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<WasteItem[]>([]);

  useEffect(() => {
    if (!sigungu || keyword.length < 1) {
      setResults([]);
      return;
    }
    wasteService.getItems({ sigungu, category, keyword }).then(setResults);
  }, [sigungu, category, keyword]);

  const handleSelect = (item: WasteItem) => {
    onSelect(item);
    setKeyword('');
    setResults([]);
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
          {results.map((item, i) => (
            <button
              key={i}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 text-sm"
              onClick={() => handleSelect(item)}
            >
              {item.wasteName}
              <span className="text-xs text-gray-400 ml-2">{item.wasteCategory}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
