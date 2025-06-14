import Env from '@/lib/env';

import {
  type CreateRiderResponse,
  type UpdateDriverProfileResponse,
  type UpdateRiderProfileData,
} from './types';

const API_BASE_URL = Env.API_URL;

export const createRiderProfileApi = async (
  accessToken: string
): Promise<CreateRiderResponse> => {
  const response = await fetch(`${API_BASE_URL}/rider/profile`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.json();
};

export const updateRiderProfileApi = async (
  accessToken: string,
  profileData: UpdateRiderProfileData
): Promise<UpdateDriverProfileResponse> => {
  const response = await fetch(`${API_BASE_URL}/rider/profile`, {
    method: 'PATCH',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profileData),
  });

  return response.json();
};
