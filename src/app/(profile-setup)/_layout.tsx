import { Stack } from 'expo-router';

import { SafeView } from '@/lib/safe-view';

export default function ProfileSetupLayout() {
  return (
    <SafeView isShowingPaddingBottom={true} isShowingPaddingTop={true}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </SafeView>
  );
}
