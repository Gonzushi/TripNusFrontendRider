import { LocationDetail } from "@/types/location";
import { create } from "zustand";

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
