import Env from '@env';

import { type VehicleType } from './types';

export const GOOGLE_API_KEY = Env.GOOGLE_API_KEY;

export const VEHICLES: readonly VehicleType[] = [
  {
    id: 'motorcycle',
    name: 'TripNus Bike',
    icon: 'motorbike',
  },
  {
    id: 'car',
    name: 'TripNus Car',
    icon: 'car',
  },
] as const;
