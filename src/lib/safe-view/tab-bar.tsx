import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TAB_CONFIG } from './constants';

// Explicitly type the paths we support
type TabPath = '/' | '/activity';

function useTabAnimation() {
  const animatedValues = React.useRef(
    Object.keys(TAB_CONFIG).reduce(
      (acc, key) => {
        acc[key] = new Animated.Value(0);
        return acc;
      },
      {} as Record<string, Animated.Value>
    )
  ).current;

  const animatePress = (key: string) => {
    Animated.sequence([
      Animated.timing(animatedValues[key], {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValues[key], {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return { animatedValues, animatePress };
}

export function TabBar() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const { animatedValues, animatePress } = useTabAnimation();

  return (
    <View
      className="flex-row items-center justify-around border-t border-gray-100 bg-white"
      style={{
        paddingBottom: insets.bottom,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 5,
      }}
    >
      {Object.entries(TAB_CONFIG).map(([key, item]) => {
        const isActive = pathname === item.path;
        const scale = animatedValues[key].interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0.9],
        });

        return (
          <TouchableOpacity
            key={item.name}
            className="flex-1 items-center py-3"
            onPress={() => {
              animatePress(key);
              if (pathname !== item.path) {
                router.replace(item.path as TabPath);
              }
            }}
          >
            <Animated.View
              style={{
                transform: [{ scale }],
              }}
            >
              <Ionicons
                name={item.icon}
                size={24}
                color={isActive ? '#2563EB' : '#9CA3AF'}
              />
            </Animated.View>
            <Text
              className={`mt-1 text-xs ${
                isActive ? 'font-medium text-blue-600' : 'text-gray-500'
              }`}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
