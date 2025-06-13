import { API_URL } from './constants';
import {
  type RideResponse,
  type UpdateRideErrorResponse,
  type UpdateRidePayload,
  type UpdateRideSuccessResponse,
} from './types';


export async function getActiveRide(
  access_token: string,
  riderId: string
): Promise<RideResponse | null> {
  const responseRaw = await fetch(`${API_URL}/ride/active-ride`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${access_token}`,
    },
    body: JSON.stringify({ riderId }),
  });

  if (!responseRaw.ok) {
    return null;
  }

  const response = await responseRaw.json();

  return response;
}

export async function updateRide(
  access_token: string,
  updatePayload: UpdateRidePayload
): Promise<{
  data: UpdateRideSuccessResponse | null;
  error: UpdateRideErrorResponse | null;
}> {
  try {
    const responseRaw = await fetch(`${API_URL}/ride/update`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify(updatePayload),
    });

    const responseJson = await responseRaw.json();

    if (!responseRaw.ok) {
      return {
        data: null,
        error: {
          status: responseRaw.status,
          ...responseJson,
        },
      };
    }

    return {
      data: responseJson,
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: {
        status: 500,
        error: 'Internal Server Error',
        message: (err as Error).message || 'Unexpected error occurred',
        code: 'INTERNAL_ERROR',
      },
    };
  }
}
