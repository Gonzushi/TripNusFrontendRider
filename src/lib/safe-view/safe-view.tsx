import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TabBar } from './tab-bar';
import { type SafeViewProps } from './types';

export default function SafeView({
  children,
  statusBarStyle = 'dark',
  statusBackgroundColor = 'bg-white',
  isShowingTabBar = false,
  isShowingPaddingTop = true,
}: SafeViewProps) {
  const insets = useSafeAreaInsets();

  return (
    <View className={`flex-1 ${statusBackgroundColor}`}>
      <StatusBar style={statusBarStyle} />
      <View
        className="flex-1"
        style={{
          paddingTop: isShowingPaddingTop ? insets.top : 0,
        }}
      >
        {children}
      </View>
      {isShowingTabBar && <TabBar />}
    </View>
  );
}
