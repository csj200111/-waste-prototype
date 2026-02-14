import type { StickerShop, CommunityCenter, TransportCompany } from '@/types/offline';
import stickerShops from '@/lib/mock-data/sticker-shops.json';
import communityCenters from '@/lib/mock-data/community-centers.json';
import transportCompanies from '@/lib/mock-data/transport-companies.json';

export const offlineService = {
  getStickerShops(regionId?: string): StickerShop[] {
    const shops = stickerShops as StickerShop[];
    if (!regionId) return shops;
    return shops.filter((s) => s.regionId === regionId);
  },

  getCommunityCenters(regionId?: string): CommunityCenter[] {
    const centers = communityCenters as CommunityCenter[];
    if (!regionId) return centers;
    return centers.filter((c) => c.regionId === regionId);
  },

  getTransportCompanies(regionId?: string): TransportCompany[] {
    const companies = transportCompanies as TransportCompany[];
    if (!regionId) return companies;
    return companies.filter((t) => t.regionId === regionId);
  },
};
