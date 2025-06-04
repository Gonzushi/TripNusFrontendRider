import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { PropsWithChildren } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type SafeViewProps = PropsWithChildren<{
  statusStyle?: string;
  tabShown?: boolean;
  paddingTop?: boolean;
  statusBarStyle?: "dark" | "light";
}>;

const TAB_CONFIG = {
  home: {
    name: "Home",
    icon: "home" as const,
    path: "/",
  },
  activity: {
    name: "Activity",
    icon: "time" as const,
    path: "/activity",
  },
  chat: {
    name: "Chat",
    icon: "chatbubbles" as const,
    path: "/chat",
  },
};

export default function SafeView({
  children,
  statusStyle = "bg-white",
  tabShown = false,
  paddingTop = true,
  statusBarStyle = "dark",
}: SafeViewProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();

  // Create animated values for each tab
  const animatedValues = React.useRef(
    Object.keys(TAB_CONFIG).reduce((acc, key) => {
      acc[key] = new Animated.Value(0);
      return acc;
    }, {} as Record<string, Animated.Value>)
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

  const TabBar = () => (
    <View
      className="flex-row items-center justify-around bg-white border-t border-gray-100"
      style={{
        paddingBottom: insets.bottom,
        shadowColor: "#000",
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
                router.replace(item.path as any);
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
                color={isActive ? "#2563EB" : "#9CA3AF"}
              />
            </Animated.View>
            <Text
              className={`text-xs mt-1 ${
                isActive ? "text-blue-600 font-medium" : "text-gray-500"
              }`}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <View className={`flex-1 ${statusStyle}`}>
      <StatusBar style={statusBarStyle} />

      <View
        className="flex-1"
        style={{ paddingTop: paddingTop ? insets.top : 0 }}
      >
        {children}
      </View>
      {tabShown && <TabBar />}
    </View>
  );
}
