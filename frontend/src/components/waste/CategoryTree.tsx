import { useState } from 'react';
import type { WasteCategory } from '@/types/waste';

interface CategoryTreeProps {
  categories: WasteCategory[];
  onSelect: (categoryId: string) => void;
  selectedId?: string;
}

interface CategoryNodeProps {
  category: WasteCategory;
  onSelect: (categoryId: string) => void;
  selectedId?: string;
  depth?: number;
}

function CategoryNode({
  category,
  onSelect,
  selectedId,
  depth = 0,
}: CategoryNodeProps) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = category.children && category.children.length > 0;
  const isSelected = category.id === selectedId;

  const handleClick = () => {
    if (hasChildren) {
      setExpanded((prev) => !prev);
    }
    onSelect(category.id);
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        className={`
          flex w-full items-center gap-2 rounded-lg px-3 py-2.5 min-h-[44px]
          text-left text-sm transition-colors duration-150
          ${isSelected ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}
        `}
        style={{ paddingLeft: `${depth * 16 + 12}px` }}
      >
        {/* 펼침/접힘 아이콘 */}
        {hasChildren ? (
          <svg
            className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${
              expanded ? 'rotate-90' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        ) : (
          <span className="w-4 shrink-0" />
        )}
        <span className="truncate">{category.name}</span>
      </button>

      {/* 하위 카테고리 */}
      {hasChildren && expanded && (
        <div>
          {category.children!.map((child) => (
            <CategoryNode
              key={child.id}
              category={child}
              onSelect={onSelect}
              selectedId={selectedId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CategoryTree({
  categories,
  onSelect,
  selectedId,
}: CategoryTreeProps) {
  return (
    <div className="flex flex-col">
      {categories.map((category) => (
        <CategoryNode
          key={category.id}
          category={category}
          onSelect={onSelect}
          selectedId={selectedId}
        />
      ))}
    </div>
  );
}
