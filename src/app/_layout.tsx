import '@/lib/background/background-notification-task';
import '../../global.css';

import { Stack } from 'expo-router';
import React from 'react';

import { AuthProvider } from '@/lib/auth';
import { initializeFirebase } from '@/lib/firebase';
import { NotificationProvider } from '@/lib/notification/notification-provider';

// adjust path to your notification utils

// Initialize Firebase
initializeFirebase();

export default function RootLayout() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Stack screenOptions={{ headerShown: false, animation: 'none' }} />
      </NotificationProvider>
    </AuthProvider>
  );
}
