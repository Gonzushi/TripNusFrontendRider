import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthContext } from '@/lib/auth';
import { type ApiResponse } from '@/types/api';

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
      const response = await fetch('https://rest.trip-nus.com/rider/profile', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${authData?.session.access_token}`,
        },
      });

      const data: ApiResponse = await response.json();

      if (data.status !== 200 && data.status !== 201) {
        throw new Error(data.message || 'Failed to create rider profile');
      }

      await setAuthData({
        ...authData!,
        riderId: data.data.id,
      });
    }
  };

  // Event Handlers
  const handleError = async (error: Error) => {
    console.error('Profile setup error:', error);
    await logOut();
    router.replace('/welcome');
  };

  const handleContinue = async () => {
    setIsLoading(true);
    try {
      await createRiderProfile();
      if (router.canDismiss()) {
        router.dismissAll();
      }
      router.replace('/');
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
          <View className="mt-6 items-center">
            <View className="flex-row items-center">
              <View className="mr-2 h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
                <Ionicons name="car" size={30} color="white" />
              </View>
              <Text className="text-2xl font-bold text-blue-600">TripNus</Text>
            </View>
          </View>
        </View>

        {/* Main Content - Centered */}
        <View className="px-6">
          {/* Header */}
          <View className="mb-8 items-center">
            <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <Ionicons name="checkmark-circle" size={32} color="#2563EB" />
            </View>
            <Text className="mb-2 text-2xl font-bold text-gray-900">
              Welcome to TripNus!
            </Text>
            <Text className="my-4 text-center text-xl font-semibold text-gray-700">
              Hi, {authData?.firstName}! 👋
            </Text>
            <Text className="text-center text-base text-gray-600">
              Your account has been created successfully. You're ready to start
              your journey with TripNus!
            </Text>
          </View>

          {/* Buttons */}
          <View className="mx-2 mt-8 space-y-4">
            <TouchableOpacity
              className={`${
                isLoading ? 'bg-blue-300' : 'bg-blue-600'
              } mb-4 flex-row items-center justify-center rounded-xl py-4`}
              onPress={handleContinue}
              disabled={isLoading}
            >
              <Ionicons
                name="home"
                size={20}
                color="white"
                style={{ marginRight: 8 }}
              />
              <Text className="text-base font-semibold text-white">
                {isLoading ? 'Setting up...' : 'Continue to Home'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Section */}
        <View>
          {/* Terms */}
          <Text className="mb-4 px-6 text-center text-sm text-gray-500">
            By continuing, you agree to our Terms of Service
          </Text>
        </View>
      </View>
    </View>
  );
}
