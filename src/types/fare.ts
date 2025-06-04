export interface FareBreakdown {
  base_fare: number;
  distance_fare: number;
  duration_fare: number;
  rounding_adjustment: number;
  platform_fee: number;
}

export interface VehicleFare {
  service_variant: string;
  fare_breakdown: FareBreakdown;
  total_fare: number;
  platform_fee: number;
  app_commission: number;
  driver_earning: number;
}

export interface FareResponse {
  motorcycle: VehicleFare;
  car: VehicleFare;
}

export interface RouteDetails {
  distance: number;
  duration: number;
  polyline: Array<{ latitude: number; longitude: number }>;
  fares: FareResponse | null;
  error?: "NO_ROUTE" | "NETWORK_ERROR" | null;
}

export interface Location {
  latitude: number;
  longitude: number;
  address: string;
}
