import { Stack } from 'expo-router';

import { AuthCheck } from '@/lib/auth';

export default function ProtectedLayout() {
  return (
    <AuthCheck>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
        }}
      />
    </AuthCheck>
  );
}
