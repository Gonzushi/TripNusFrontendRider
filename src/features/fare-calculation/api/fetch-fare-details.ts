import { API_URL } from '../constants';
import { type FareResponse } from '../types';

type FetchFareDetailsProps = {
  accessToken: string;
  distanceM: number;
  durationSec: number;
  pickup: {
    longitude: number;
    latitude: number;
  };
};

export default async function fetchFareDetails({
  accessToken,
  distanceM,
  durationSec,
}: FetchFareDetailsProps): Promise<FareResponse | null> {
  try {
    const response = await fetch(`${API_URL}/fare/calculate`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        Authorization: 'Bearer ' + accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        distanceM: distanceM,
        durationSec: durationSec,
      }),
    });

    const data = await response.json();

    if (data.status === 200) {
      return data.data;
    }
    return null;
  } catch (error) {
    console.log('Error fetching fare:', error);
    return null;
  }
}
