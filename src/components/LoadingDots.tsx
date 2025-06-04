import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

interface LoadingDotsProps {
  color?: string;
  size?: number;
  spacing?: number;
}

export default function LoadingDots({
  color = "#3B82F6",
  size = 5,
  spacing = 3,
}: LoadingDotsProps) {
  const dots = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    const animations = dots.map((dot, index) => {
      return Animated.sequence([
        // Wait for previous dots
        Animated.delay(index * 200),
        // Animation loop
        Animated.loop(
          Animated.sequence([
            // Move up
            Animated.timing(dot, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            // Move down
            Animated.timing(dot, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ])
        ),
      ]);
    });

    // Start all animations
    Animated.parallel(animations).start();

    // Cleanup
    return () => {
      animations.forEach((anim) => anim.stop());
    };
  }, []);

  return (
    <View className="flex-row items-center">
      {dots.map((dot, index) => (
        <Animated.View
          key={index}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
            marginHorizontal: spacing,
            transform: [
              {
                translateY: dot.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -size * 2], // Move up by 2x the dot size
                }),
              },
            ],
          }}
        />
      ))}
    </View>
  );
}
