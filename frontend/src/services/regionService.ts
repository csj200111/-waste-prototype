import { apiFetch } from '@/lib/apiClient';

export const regionService = {
  async getSido(): Promise<string[]> {
    return apiFetch<string[]>('/api/regions/sido');
  },

  async getSigungu(sido: string): Promise<string[]> {
    return apiFetch<string[]>(`/api/regions/sigungu?sido=${encodeURIComponent(sido)}`);
  },
};
