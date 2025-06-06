import { INDONESIA_BOUNDS } from './constants';
import type { Coordinates } from './types';

export function isLocationInIndonesia(coordinates: Coordinates): boolean {
  const { latitude, longitude } = coordinates;

  return (
    latitude <= INDONESIA_BOUNDS.north &&
    latitude >= INDONESIA_BOUNDS.south &&
    longitude >= INDONESIA_BOUNDS.west &&
    longitude <= INDONESIA_BOUNDS.east
  );
}
