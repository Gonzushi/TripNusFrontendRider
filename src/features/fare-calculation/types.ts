import { type MaterialCommunityIcons } from '@expo/vector-icons';
import type MapView from 'react-native-maps';

import { type VEHICLES } from './constants';

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type Location = {
  latitude: number;
  longitude: number;
  address: string;
};

export type Vehicle = (typeof VEHICLES)[number];

export type VehicleType = {
  id: 'motorcycle' | 'car';
  name: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
};

export type FareBreakdown = {
  base_fare: number;
  distance_fare: number;
  duration_fare: number;
  rounding_adjustment: number;
  platform_fee: number;
};

export type VehicleFare = {
  service_variant: string;
  fare_breakdown: FareBreakdown;
  total_fare: number;
  platform_fee: number;
  app_commission: number;
  driver_earning: number;
};

export type FareResponse = {
  motorcycle: VehicleFare;
  car: VehicleFare;
};

export type RouteDetails = {
  distance: number;
  duration: number;
  polyline: Array<{ latitude: number; longitude: number }>;
  fares: FareResponse | null;
  error?: 'NO_ROUTE' | 'NETWORK_ERROR' | null;
};

export type MapRef = React.RefObject<MapView | null>;
