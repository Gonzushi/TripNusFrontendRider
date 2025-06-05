import { useNotifications } from '@/hooks/useNotifications';
import { AuthProvider } from '@/utils/authContext';
import { initializeFirebase } from '@/utils/firebase';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../../global.css';

// Configure the linking before the app renders
export const unstable_settings = {
  initialRouteName: 'welcome',
};

export default function RootLayout() {
  useEffect(() => {
    // Initialize Firebase before notifications
    const initFirebase = async () => {
      try {
        await initializeFirebase();
      } catch (error) {
        console.error('Failed to initialize Firebase:', error);
      }
    };

    initFirebase();
  }, []);

  // Initialize notifications
  useNotifications();

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen
            name="(protected)"
            options={{
              headerShown: false,
              animation: 'none',
            }}
          />
          <Stack.Screen
            name="(authentication)"
            options={{
              headerShown: false,
              animation: 'none',
            }}
          />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
