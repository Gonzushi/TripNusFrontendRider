import { ApiResponse } from "@/types/api";
import { AuthContext } from "@/utils/authContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useContext, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProfileSuccess() {
  // State
  const [isLoading, setIsLoading] = useState(false);

  // Hooks
  const { authData, setAuthData, logOut } = useContext(AuthContext);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // API Calls
  const createRiderProfile = async (): Promise<void> => {
    if (!authData?.riderId) {
      const response = await fetch("https://rest.trip-nus.com/rider/profile", {
        method: "POST",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${authData?.session.access_token}`,
        },
      });

      const data: ApiResponse = await response.json();

      if (data.status !== 200 && data.status !== 201) {
        throw new Error(data.message || "Failed to create rider profile");
      }

      await setAuthData({
        ...authData!,
        riderId: data.data.id,
      });
    }
  };

  // Event Handlers
  const handleError = async (error: Error) => {
    console.error("Profile setup error:", error);
    await logOut();
    router.replace("/welcome");
  };

  const handleContinue = async () => {
    setIsLoading(true);
    try {
      await createRiderProfile();
      if (router.canDismiss()) {
        router.dismissAll();
      }
      router.replace("/");
    } catch (error) {
      await handleError(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View
      className="flex-1 bg-white"
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <View className="flex-1 justify-between">
        {/* Top Section */}
        <View>
          {/* Logo Section */}
          <View className="items-center mt-6">
            <View className="flex-row items-center">
              <View className="bg-blue-600 w-12 h-12 rounded-xl items-center justify-center mr-2">
                <Ionicons name="car" size={30} color="white" />
              </View>
              <Text className="text-2xl font-bold text-blue-600">TripNus</Text>
            </View>
          </View>
        </View>

        {/* Main Content - Centered */}
        <View className="px-6">
          {/* Header */}
          <View className="items-center mb-8">
            <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="checkmark-circle" size={32} color="#2563EB" />
            </View>
            <Text className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to TripNus!
            </Text>
            <Text className="text-xl font-semibold text-gray-700 my-4 text-center">
              Hi, {authData?.firstName}! 👋
            </Text>
            <Text className="text-base text-gray-600 text-center">
              Your account has been created successfully. You're ready to start
              your journey with TripNus!
            </Text>
          </View>

          {/* Buttons */}
          <View className="mt-8 space-y-4 mx-2">
            <TouchableOpacity
              className={`${
                isLoading ? "bg-blue-300" : "bg-blue-600"
              } py-4 rounded-xl items-center flex-row justify-center mb-4`}
              onPress={handleContinue}
              disabled={isLoading}
            >
              <Ionicons
                name="home"
                size={20}
                color="white"
                style={{ marginRight: 8 }}
              />
              <Text className="text-white font-semibold text-base">
                {isLoading ? "Setting up..." : "Continue to Home"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Section */}
        <View>
          {/* Terms */}
          <Text className="text-sm text-gray-500 text-center px-6 mb-4">
            By continuing, you agree to our Terms of Service
          </Text>
        </View>
      </View>
    </View>
  );
}
