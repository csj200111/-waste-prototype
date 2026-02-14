import type { WasteCategory, WasteItem } from '@/types/waste';
import categories from '@/lib/mock-data/waste-categories.json';
import items from '@/lib/mock-data/waste-items.json';

export const wasteService = {
  getCategories(): WasteCategory[] {
    return categories as WasteCategory[];
  },

  getItemsByCategory(categoryId: string): WasteItem[] {
    return (items as WasteItem[]).filter((item) => item.categoryId === categoryId);
  },

  searchWasteItems(keyword: string): WasteItem[] {
    const trimmed = keyword.trim().toLowerCase();
    if (!trimmed) return [];

    return (items as WasteItem[]).filter((item) =>
      item.name.toLowerCase().includes(trimmed),
    );
  },

  getItemById(id: string): WasteItem | undefined {
    return (items as WasteItem[]).find((item) => item.id === id);
  },
};
