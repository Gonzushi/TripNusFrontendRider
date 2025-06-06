import { create } from 'zustand';

import { type LocationDetail } from '@/types/location';

type LocationStore = {
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
