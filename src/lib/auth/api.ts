import { API_BASE_URL } from './constants';
import { type ApiRequestResponse, type AuthData } from './types';

export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiRequestResponse<T>> => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const apiOutput = await response.json();
    return {
      data:
        apiOutput.status === 200 || apiOutput.status === 201
          ? (apiOutput.data as T)
          : null,
      error:
        apiOutput.status >= 400 ? apiOutput.message || 'Unknown error' : null,
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Network error occurred',
    };
  }
};

export const registerApi = async (email: string, password: string) => {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

export const resendActivationApi = async (email: string) => {
  return apiRequest('/auth/resend-activation', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
};

export const loginApi = async (email: string, password: string) => {
  return apiRequest<AuthData>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

export const refreshTokenApi = async (
  refreshToken: string
): Promise<AuthData | null> => {
  const { data } = await apiRequest<AuthData>('/auth/refresh-token', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  return data;
};

export const logoutApi = async (accessToken: string) => {
  return apiRequest('/auth/logout', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ scope: 'local' }),
  });
};

export const changePasswordApi = async (
  type: string,
  tokenHash: string,
  password: string
) => {
  return apiRequest('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ type, tokenHash, password }),
  });
};

export const forgotPasswordApi = async (email: string) => {
  return apiRequest('/auth/reset-password-for-email', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
};
