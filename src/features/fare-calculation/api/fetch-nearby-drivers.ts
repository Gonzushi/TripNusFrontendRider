import { API_URL } from '../constants';
import type { Location, NearbyDrivers } from '../types';

type FetchNearbyDriversProps = {
  accessToken: string;
  pickup: Location;
};

export default async function fetchNearbyDrivers({
  accessToken,
  pickup,
}: FetchNearbyDriversProps): Promise<NearbyDrivers | null> {
  try {
    const response = await fetch(`${API_URL}/driver/nearby`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ pickup }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('Nearby driver error:', data);
      return null;
    }

    return data.data as NearbyDrivers;
  } catch (error) {
    console.error('Network error fetching nearby drivers:', error);
    return null;
  }
}
