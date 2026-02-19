interface CategoryTreeProps {
  categories: string[];
  selected?: string;
  onSelect: (category: string | undefined) => void;
}

export default function CategoryTree({ categories, selected, onSelect }: CategoryTreeProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onSelect(undefined)}
        className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
          !selected
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
        }`}
      >
        전체
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          type="button"
          onClick={() => onSelect(cat)}
          className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
            selected === cat
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
