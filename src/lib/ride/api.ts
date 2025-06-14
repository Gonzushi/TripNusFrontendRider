import { API_URL } from './constants';
import { type CancelRideResponse, type RideResponse } from './types';

export async function getActiveRide(
  access_token: string
): Promise<RideResponse | null> {
  const responseRaw = await fetch(`${API_URL}/ride/active-ride-by-rider`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${access_token}`,
    },
  });

  if (!responseRaw.ok) {
    return null;
  }

  const response = await responseRaw.json();

  return response;
}

export async function cancelRideByRiderBeforePickup(
  access_token: string,
  body: {
    ride_id: string;
    rider_id: string;
  }
): Promise<CancelRideResponse> {
  const responseRaw = await fetch(
    `${API_URL}/ride/cancel-by-rider-before-pickup`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify(body),
    }
  );

  const responseJson = await responseRaw.json();
  return responseJson;
}
