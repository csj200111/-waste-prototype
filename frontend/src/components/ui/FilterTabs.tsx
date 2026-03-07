interface FilterTabsProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function FilterTabs({ tabs, activeTab, onTabChange }: FilterTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`
            shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors
            ${
              activeTab === tab
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 border border-gray-300'
            }
          `}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
