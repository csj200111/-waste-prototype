import { apiFetch } from '@/lib/apiClient';
import type { RecycleItem, RecycleStatus } from '@/types/recycle';

export const recycleService = {
  async getItems(sigungu?: string): Promise<RecycleItem[]> {
    const query = sigungu ? `?sigungu=${encodeURIComponent(sigungu)}` : '';
    return apiFetch<RecycleItem[]>(`/api/recycle/items${query}`);
  },

  async getMyItems(userId: string): Promise<RecycleItem[]> {
    return apiFetch<RecycleItem[]>('/api/recycle/items/my', {
      headers: { 'X-User-Id': userId },
    });
  },

  async registerItem(
    data: {
      title: string;
      description: string;
      photos: string[];
      sido: string;
      sigungu: string;
      address: string;
      lat?: number;
      lng?: number;
    },
    userId = 'anonymous',
  ): Promise<RecycleItem> {
    return apiFetch<RecycleItem>('/api/recycle/items', {
      method: 'POST',
      headers: { 'X-User-Id': userId },
      body: JSON.stringify(data),
    });
  },

  async updateStatus(id: number, status: RecycleStatus): Promise<RecycleItem> {
    return apiFetch<RecycleItem>(`/api/recycle/items/${id}/status?status=${status}`, {
      method: 'PATCH',
    });
  },

  async deleteItem(id: number): Promise<void> {
    await apiFetch(`/api/recycle/items/${id}`, {
      method: 'DELETE',
    });
  },
};
