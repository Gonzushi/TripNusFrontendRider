type Coordinates = {
  latitude: number;
  longitude: number;
};

// Indonesia's rough bounding box
const INDONESIA_BOUNDS = {
  north: 6, // Northern limit
  south: -11, // Southern limit
  west: 95, // Western limit
  east: 141, // Eastern limit
};

export function isLocationInIndonesia(coordinates: Coordinates): boolean {
  const { latitude, longitude } = coordinates;

  return (
    latitude <= INDONESIA_BOUNDS.north &&
    latitude >= INDONESIA_BOUNDS.south &&
    longitude >= INDONESIA_BOUNDS.west &&
    longitude <= INDONESIA_BOUNDS.east
  );
}
