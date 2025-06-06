import { Redirect } from 'expo-router';
import { useContext } from 'react';

import { AuthContext } from './auth-context';

export default function AuthCheck({ children }: { children: React.ReactNode }) {
  const authState = useContext(AuthContext);

  if (!authState.isReady) {
    return null;
  }

  if (!authState.isLoggedIn) {
    return <Redirect href="/welcome" />;
  }

  if (!authState.authData?.firstName) {
    return <Redirect href="/profile-setup" />;
  }

  if (!authState.authData?.riderId) {
    return <Redirect href="/profile-success" />;
  }

  return children;
}
