import { AuthContext } from "@/utils/authContext";
import { Redirect, Stack, usePathname } from "expo-router";
import { useContext } from "react";

export default function RidesLayout() {
  const pathname = usePathname();
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

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "white",
        },
        headerTitleStyle: {
          color: "#1F2937",
          fontWeight: "bold",
        },
        headerTitleAlign: "center",
        animation: pathname.startsWith("/(home)") ? "default" : "none",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ride-request"
        options={{
          title: "Ride Request",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
