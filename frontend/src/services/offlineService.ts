import { apiFetch } from '@/lib/apiClient';
import type { StickerShop, CommunityCenter, TransportCompany, WasteFacility } from '@/types/offline';

export const offlineService = {
  async getStickerShops(sigungu?: string): Promise<StickerShop[]> {
    const query = sigungu ? `?sigungu=${encodeURIComponent(sigungu)}` : '';
    return apiFetch<StickerShop[]>(`/api/offline/sticker-shops${query}`);
  },

  async getCenters(sigungu?: string): Promise<CommunityCenter[]> {
    const query = sigungu ? `?sigungu=${encodeURIComponent(sigungu)}` : '';
    return apiFetch<CommunityCenter[]>(`/api/offline/centers${query}`);
  },

  async getTransportCompanies(sigungu?: string): Promise<TransportCompany[]> {
    const query = sigungu ? `?sigungu=${encodeURIComponent(sigungu)}` : '';
    return apiFetch<TransportCompany[]>(`/api/offline/transport${query}`);
  },

  async getWasteFacilities(sido: string, sigungu?: string): Promise<WasteFacility[]> {
    const params = new URLSearchParams({ sido });
    if (sigungu) params.append('sigungu', sigungu);
    return apiFetch<WasteFacility[]>(`/api/offline/waste-facilities?${params}`);
  },
};
