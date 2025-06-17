import { create } from 'zustand';

import { type RideData, type RideStatus } from './types';

type RideStore = {
  rideData: RideData | null;
  setRideData: (data: RideData | null) => void;
  rideStatus: RideStatus | null;
  setRideStatus: (status: RideStatus | null) => void;
};

export const useRideStore = create<RideStore>((set) => ({
  rideData: null,
  setRideData: (data) => set({ rideData: data }),
  rideStatus: null,
  setRideStatus: (status) => set({ rideStatus: status }),
}));
