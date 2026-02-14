import type { Region } from '@/types/region';
import regions from '@/lib/mock-data/regions.json';

export const regionService = {
  getRegions(): Region[] {
    return regions;
  },

  searchRegion(query: string): Region[] {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return regions;

    return regions.filter(
      (r) =>
        r.city.toLowerCase().includes(trimmed) ||
        r.district.toLowerCase().includes(trimmed) ||
        r.dong.toLowerCase().includes(trimmed),
    );
  },

  getRegionById(id: string): Region | undefined {
    return regions.find((r) => r.id === id);
  },

  getRegionLabel(region: Region): string {
    return `${region.city} ${region.district} ${region.dong}`;
  },
};
