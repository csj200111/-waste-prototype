import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Location } from '@/types/location';

interface LocationState {
  currentLocation: Location | null;
  isOnboarded: boolean;
  setLocation: (location: Location) => void;
  setOnboarded: () => void;
  clearLocation: () => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      currentLocation: null,
      isOnboarded: false,
      setLocation: (location) => set({ currentLocation: location, isOnboarded: true }),
      setOnboarded: () => set({ isOnboarded: true }),
      clearLocation: () => set({ currentLocation: null }),
    }),
    { name: 'eolmage_location' }
  )
);
