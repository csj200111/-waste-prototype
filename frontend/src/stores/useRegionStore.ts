import { create } from 'zustand';
import type { Region } from '@/types/region';

interface RegionState {
  selectedRegion: Region | null;
  setSelectedRegion: (region: Region) => void;
  clearRegion: () => void;
}

export const useRegionStore = create<RegionState>((set) => ({
  selectedRegion: null,
  setSelectedRegion: (region) => set({ selectedRegion: region }),
  clearRegion: () => set({ selectedRegion: null }),
}));
