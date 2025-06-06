import Env from '@/lib/env';

import {
  type CreateRiderResponse,
  type UpdatePhoneResponse,
  type UpdateProfileResponse,
} from './types';

const API_BASE_URL = Env.API_URL;

export const updateProfileApi = async (
  accessToken: string,
  firstName: string,
  lastName?: string
): Promise<UpdateProfileResponse> => {
  const response = await fetch(`${API_BASE_URL}/user/profile`, {
    method: 'PATCH',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      first_name: firstName.trim(),
      last_name: lastName?.trim() || undefined,
    }),
  });

  return response.json();
};

export const updatePhoneApi = async (
  accessToken: string,
  phone: string
): Promise<UpdatePhoneResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/update-phone`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      phone: phone.trim(),
    }),
  });

  return response.json();
};

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
