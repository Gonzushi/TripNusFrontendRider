import {
  clearProfilePicture,
  downloadAndSaveProfilePicture,
} from '@/lib/profile-picture';
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
  changePasswordApi,
  loginApi,
  logoutApi,
  refreshTokenApi,
  registerApi,
  resendActivationApi,
} from './api';
import { AUTH_STORAGE_KEY } from './constants';
import { AuthContextType, AuthData, AuthStateInternal } from './types';

// Create context with default values
export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  isReady: false,
  authData: null,
  setAuthData: async () => {},
  register: async () => {},
  resendActivation: async () => false,
  changePassword: async () => {},
  logIn: async () => {},
  logOut: async () => {},
});

export function AuthProvider({ children }: PropsWithChildren) {
  const [isReady, setIsReady] = useState(false);
  const [authState, setAuthState] = useState<AuthStateInternal>({
    isLoggedIn: false,
    data: null,
  });
  const router = useRouter();

  // Auth State Management
  const updateAuthState = async (newState: AuthStateInternal) => {
    try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newState));
      setAuthState(newState);
    } catch (error) {
      console.error('Error saving auth state:', error);
    }
  };

  const setAuthData = async (data: AuthData) => {
    await updateAuthState({ isLoggedIn: true, data });
  };

  // Token Management
  const checkAndRefreshToken = async (
    data: AuthData
  ): Promise<AuthData | null> => {
    const now = Math.floor(Date.now() / 1000);
    if (data.session.expires_at > now) return data;

    const newData = await refreshTokenApi(data.session.refresh_token);
    if (newData) {
      await updateAuthState({ isLoggedIn: true, data: newData });
    }
    return newData;
  };

  // Auth Actions
  const logIn = async (email: string, password: string) => {
    const { data, error } = await loginApi(email, password);

    if (data) {
      await updateAuthState({ isLoggedIn: true, data });
      if (data.riderProfilePictureUrl) {
        await downloadAndSaveProfilePicture(
          data.user.id,
          data.riderProfilePictureUrl
        );
      }
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
    const { error } = await registerApi(email, password);

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
    const { error } = await resendActivationApi(email);

    if (!error) return true;

    Alert.alert('Error', error || 'Failed to send activation email');
    return false;
  };

  const changePassword = async (
    type: string,
    tokenHash: string,
    password: string
  ) => {
    const { error } = await changePasswordApi(type, tokenHash, password);

    if (!error) {
      Alert.alert('Success', 'Password has been changed successfully', [
        {
          text: 'OK',
          onPress: () => {
            if (router.canDismiss()) {
              router.dismissAll();
            }
            router.replace('/welcome');
          },
        },
      ]);
    } else {
      Alert.alert('Error', error || 'Failed to change password', [
        {
          text: 'OK',
          onPress: () => {
            if (router.canDismiss()) {
              router.dismissAll();
            }
            router.replace('/welcome');
          },
        },
      ]);
    }
  };

  const logOut = async () => {
    try {
      if (authState.data?.session.access_token) {
        await logoutApi(authState.data.session.access_token);
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      await updateAuthState({ isLoggedIn: false, data: null });
      await clearProfilePicture(authState.data?.user.id!);
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
        setAuthData,
        register,
        resendActivation,
        changePassword,
        logIn,
        logOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
