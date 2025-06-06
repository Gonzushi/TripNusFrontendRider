import { GOOGLE_API_KEY } from '../constants';
import type { LocationDetail } from '../types';

// Fetches location details from Google Places API
export async function fetchLocationDetail(
  placeId: string
): Promise<LocationDetail | null> {
  try {
    const url = `https://places.googleapis.com/v1/places/${placeId}`;
    const response = await fetch(url, {
      headers: {
        'X-Goog-Api-Key': GOOGLE_API_KEY,
        'X-Goog-FieldMask': 'id,displayName,formattedAddress,location',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const place = await response.json();

    if (place) {
      return {
        title: place.displayName.text,
        address: place.formattedAddress,
        place_id: place.id,
        coordinates: place.location
          ? {
              latitude: place.location.latitude,
              longitude: place.location.longitude,
            }
          : undefined,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching location details:', error);
    return null;
  }
}
