import Env from '@/lib/env';

import { type UpdatePhoneResponse } from './types';

const API_BASE_URL = Env.API_URL;

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
