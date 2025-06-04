import { Stack } from "expo-router";
import React from "react";

export default function RideRequestLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="map-picker"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="fare-calculation"
        options={{
          headerShown: false,
        }}
      />

    </Stack>
  );
}
