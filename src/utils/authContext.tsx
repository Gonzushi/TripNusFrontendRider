import { ApiResponse } from '@/types/api';
import { AuthData, AuthState } from '@/types/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SplashScreen, useRouter } from 'expo-router';
import React, {
  createContext,
  PropsWithChildren,
  useEffect,
  useState,
} from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';
import {
  clearProfilePicture,
  downloadAndSaveProfilePicture,
} from './profilePicture';

// Constants
const AUTH_STORAGE_KEY = 'auth-key';
const API_BASE_URL = 'https://rest.trip-nus.com';

// Types
type AuthStateInternal = {
  isLoggedIn: boolean;
  data: AuthData | null;
};

// API Helpers
const apiRequest = async <T,>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: string | null }> => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const apiOutput: ApiResponse = await response.json();
    return {
      data:
        apiOutput.status === 200 || apiOutput.status === 201
          ? (apiOutput.data as T)
          : null,
      error:
        apiOutput.status >= 400 ? apiOutput.message || 'Unknown error' : null,
    };
  } catch (error) {
    return { data: null, error: 'Network error occurred' };
  }
};

// Default context value
export const AuthContext = createContext<AuthState>({
  isLoggedIn: false,
  isReady: false,
  authData: null,
  logIn: async () => {},
  register: async () => {},
  resendActivation: async () => false,
  logOut: () => {},
  setAuthData: async () => {},
});

export function AuthProvider({ children }: PropsWithChildren) {
  const [isReady, setIsReady] = useState(false);
  const [authState, setAuthState] = useState<AuthStateInternal>({
    isLoggedIn: false,
    data: null,
  });
  const router = useRouter();

  // Profile Picture Management
  const handleProfilePicture = async (
    userId: string,
    pictureUrl: string | null
  ) => {
    if (pictureUrl) {
      await downloadAndSaveProfilePicture(userId, pictureUrl);
    } else if (userId) {
      await clearProfilePicture(userId);
    }
  };

  // Auth State Management
  const updateAuthState = async (newState: AuthStateInternal) => {
    try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newState));
      setAuthState(newState);

      if (newState.isLoggedIn && newState.data) {
        await handleProfilePicture(
          newState.data.user.id,
          newState.data.riderProfilePictureUrl
        );
      } else if (authState.data?.user.id) {
        await handleProfilePicture(authState.data.user.id, null);
      }
    } catch (error) {
      console.error('Error saving auth state:', error);
    }
  };

  const setAuthData = async (data: AuthData) => {
    await updateAuthState({ isLoggedIn: true, data });
  };

  // Token Management
  const refreshToken = async (
    refreshToken: string
  ): Promise<AuthData | null> => {
    const { data } = await apiRequest<AuthData>('/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    return data;
  };

  const checkAndRefreshToken = async (
    data: AuthData
  ): Promise<AuthData | null> => {
    const now = Math.floor(Date.now() / 1000);
    if (data.session.expires_at > now) return data;

    const newData = await refreshToken(data.session.refresh_token);
    if (newData) {
      await updateAuthState({ isLoggedIn: true, data: newData });
    }
    return newData;
  };

  // Auth Actions
  const logIn = async (email: string, password: string) => {
    const { data, error } = await apiRequest<AuthData>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (data) {
      await updateAuthState({ isLoggedIn: true, data });
      if (router.canDismiss()) {
        router.dismissAll();
      }
      router.replace('/');
    } else if (error === 'Email not confirmed') {
      router.push({ pathname: '/resend', params: { email } });
    } else {
      Alert.alert('Login Failed', error || 'Invalid email or password.');
    }
  };

  const register = async (email: string, password: string) => {
    const { error } = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (!error) {
      Alert.alert(
        'Registration Successful',
        'Please check your email to activate your account.',
        [{ text: 'OK', onPress: () => router.replace('/login') }]
      );
    } else {
      Alert.alert(
        'Registration Failed',
        error || 'An error occurred during registration.'
      );
    }
  };

  const resendActivation = async (email: string): Promise<boolean> => {
    const { error } = await apiRequest('/auth/resend-activation', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    if (!error) return true;

    Alert.alert('Error', error || 'Failed to send activation email');
    return false;
  };

  const logOut = async () => {
    try {
      if (authState.data?.session.access_token) {
        await apiRequest('/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authState.data.session.access_token}`,
          },
          body: JSON.stringify({ scope: 'local' }),
        });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      await updateAuthState({ isLoggedIn: false, data: null });
      router.replace('/welcome');
    }
  };

  // Initialization
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const value = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (value) {
          const storedState = JSON.parse(value);
          if (storedState.isLoggedIn && storedState.data) {
            const validData = await checkAndRefreshToken(storedState.data);
            console.log(validData);
            await updateAuthState({
              isLoggedIn: !!validData,
              data: validData,
            });
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      }
      setIsReady(true);
    };

    console.log('Initializing auth');
    initializeAuth();
  }, []);

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: authState.isLoggedIn,
        isReady,
        authData: authState.data,
        logIn,
        register,
        resendActivation,
        logOut,
        setAuthData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
