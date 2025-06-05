import { AuthCheck } from '@/lib/auth';
import { Stack } from 'expo-router';

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
