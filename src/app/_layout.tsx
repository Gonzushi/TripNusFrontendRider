import { AuthProvider } from '@/lib/auth';
import { initializeFirebase } from '@/lib/firebase';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../../global.css';

// Initialize Firebase
initializeFirebase();

export default function RootLayout() {
  // Use ref to track if notifications have been initialized
  // const notificationsInitialized = useRef(false);

  // useEffect(() => {
  //   if (notificationsInitialized.current) return;

  //   // Initialize notifications only once
  //   useNotifications();
  //   notificationsInitialized.current = true;
  // }, []);

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
