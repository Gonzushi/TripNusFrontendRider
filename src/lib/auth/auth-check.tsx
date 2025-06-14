import { Redirect } from 'expo-router';
import { useContext } from 'react';

import { AuthContext } from './auth-context';

export default function AuthCheck({ children }: { children: React.ReactNode }) {
  const authState = useContext(AuthContext);

  if (authState.authData) {
    authState.checkAndRefreshToken(authState.authData);
  }

  if (!authState.isReady) {
    return null;
  }

  if (!authState.isLoggedIn) {
    return <Redirect href="/welcome" />;
  }

  if (
    !authState.authData?.riderId ||
    !authState.authData?.riderFirstName ||
    !authState.authData?.phone
  ) {
    return <Redirect href="/profile-setup" />;
  }

  return children;
}
