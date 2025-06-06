import '../../global.css';

import { Stack } from 'expo-router';
import React from 'react';

import { AuthProvider } from '@/lib/auth';
import { initializeFirebase } from '@/lib/firebase';

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
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false, animation: 'none' }} />
    </AuthProvider>
  );
}
