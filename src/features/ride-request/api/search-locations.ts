import { GOOGLE_API_KEY, LOCATION_SEARCH_RADIUS_M } from '../constants';
import type { Coordinates, SearchLocationsResult } from '../types';

// Searches for locations using Google Places API
export async function searchLocations(
  searchText: string,
  locationBias: Coordinates,
  searchRadiusInMeters: number = LOCATION_SEARCH_RADIUS_M
): Promise<SearchLocationsResult[]> {
  try {
    const url = `https://places.googleapis.com/v1/places:searchText`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_API_KEY,
        'X-Goog-FieldMask':
          'places.displayName,places.formattedAddress,places.id,places.location',
      },
      body: JSON.stringify({
        textQuery: searchText,
        locationBias: {
          circle: {
            center: {
              latitude: locationBias.latitude,
              longitude: locationBias.longitude,
            },
            radius: searchRadiusInMeters,
          },
        },
        languageCode: 'en',
        regionCode: 'ID',
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return (data.places as SearchLocationsResult[]) || [];
  } catch (error) {
    console.error('Error searching locations:', error);
    return [];
  }
}
