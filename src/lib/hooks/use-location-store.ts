import { create } from 'zustand';

import { type LocationDetail } from '@/features/ride-request/types';

export type SelectedMapLocation = {
  location: LocationDetail;
  type: string;
};

export type LocationStore = {
  selectedMapLocation: {
    location: LocationDetail;
    type: string;
  } | null;
  setSelectedMapLocation: (location: LocationDetail, type: string) => void;
  clearSelectedMapLocation: () => void;
};

export const useLocationStore = create<LocationStore>((set) => ({
  selectedMapLocation: null,
  setSelectedMapLocation: (location, type) =>
    set({ selectedMapLocation: { location, type } }),
  clearSelectedMapLocation: () => set({ selectedMapLocation: null }),
}));
