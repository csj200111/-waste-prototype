import { create } from 'zustand';
import type { DisposalItem, DisposalApplication } from '@/types/disposal';
import type { Region } from '@/types/region';

interface DisposalState {
  region: Region | null;
  disposalAddress: string;
  preferredDate: string;
  items: DisposalItem[];
  completedApplication: DisposalApplication | null;

  setRegion: (region: Region | null) => void;
  setDisposalAddress: (address: string) => void;
  setPreferredDate: (date: string) => void;
  addItem: (item: DisposalItem) => void;
  removeItem: (index: number) => void;
  setCompletedApplication: (app: DisposalApplication) => void;
  getTotalFee: () => number;
  reset: () => void;
}

export const useDisposalStore = create<DisposalState>((set, get) => ({
  region: null,
  disposalAddress: '',
  preferredDate: '',
  items: [],
  completedApplication: null,

  setRegion: (region) => set({ region }),
  setDisposalAddress: (address) => set({ disposalAddress: address }),
  setPreferredDate: (date) => set({ preferredDate: date }),
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  removeItem: (index) =>
    set((state) => ({ items: state.items.filter((_, i) => i !== index) })),
  setCompletedApplication: (app) => set({ completedApplication: app }),
  getTotalFee: () =>
    get().items.reduce((sum, item) => sum + item.fee * item.quantity, 0),
  reset: () =>
    set({
      region: null,
      disposalAddress: '',
      preferredDate: '',
      items: [],
      completedApplication: null,
    }),
}));
