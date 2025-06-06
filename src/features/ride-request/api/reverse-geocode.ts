import { GOOGLE_API_KEY } from '../constants';
import type { Coordinates, LocationDetail } from '../types';

// Reverse geocodes coordinates to get address details
export async function reverseGeocode(
  coords: Coordinates
): Promise<LocationDetail | null> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?` +
        `latlng=${coords.latitude},${coords.longitude}` +
        `&key=${GOOGLE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      return {
        title: 'Current Location',
        address: result.formatted_address,
        place_id: result.place_id,
        coordinates: coords,
      };
    }

    // Fallback if no results found
    return {
      title: 'Current Location',
      address: `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`,
      coordinates: coords,
    };
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    // Fallback on error
    return {
      title: 'Current Location',
      address: `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`,
      coordinates: coords,
    };
  }
}
