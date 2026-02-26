import { apiFetch } from '@/lib/apiClient';
import type { WasteItem } from '@/types/waste';

export const wasteService = {
  async getCategories(): Promise<string[]> {
    return apiFetch<string[]>('/api/waste/categories');
  },

  async getItems(params: {
    sigungu: string;
    category?: string;
    keyword?: string;
  }): Promise<WasteItem[]> {
    const query = new URLSearchParams({ sigungu: params.sigungu });
    if (params.category) query.set('category', params.category);
    if (params.keyword) query.set('keyword', params.keyword);
    return apiFetch<WasteItem[]>(`/api/waste/items?${query}`);
  },
};
