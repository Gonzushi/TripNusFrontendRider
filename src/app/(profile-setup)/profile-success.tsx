import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { AuthContext } from '@/lib/auth';
import { createRiderProfileApi } from '@/lib/user';

// Logo component with TripNus branding
function Logo() {
  return (
    <View className="mt-6 items-center">
      <View className="flex-row items-center">
        <View className="mr-2 h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
          <Ionicons name="car" size={30} color="white" />
        </View>
        <Text className="text-2xl font-bold text-blue-600">TripNus</Text>
      </View>
    </View>
  );
}

// Header component with welcome message
function Header({ firstName }: { firstName: string }) {
  return (
    <View className="mb-8 items-center">
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-blue-100">
        <Ionicons name="checkmark-circle" size={32} color="#2563EB" />
      </View>
      <Text className="mb-2 text-2xl font-bold text-gray-900">
        Selamat Datang di TripNus!
      </Text>
      <Text className="my-4 text-center text-xl font-semibold text-gray-700">
        Hai, {firstName}! 👋
      </Text>
      <Text className="text-center text-base text-gray-600">
        Akun Anda telah berhasil dibuat. Anda siap untuk memulai perjalanan
        dengan TripNus!
      </Text>
    </View>
  );
}

// Continue button component
function ContinueButton({
  onPress,
  isLoading,
}: {
  onPress: () => void;
  isLoading: boolean;
}) {
  return (
    <TouchableOpacity
      className={`${
        isLoading ? 'bg-blue-300' : 'bg-blue-600'
      } mb-4 flex-row items-center justify-center rounded-xl py-4`}
      onPress={onPress}
      disabled={isLoading}
    >
      <Ionicons
        name="home"
        size={20}
        color="white"
        style={{ marginRight: 8 }}
      />
      <Text className="text-base font-semibold text-white">
        {isLoading ? 'Menyiapkan...' : 'Lanjut ke Beranda'}
      </Text>
    </TouchableOpacity>
  );
}

export default function ProfileSuccess() {
  const [isLoading, setIsLoading] = useState(false);
  const { authData, setAuthData, logOut } = useContext(AuthContext);
  const router = useRouter();

  // Create rider profile if not exists
  const createRiderProfile = async (): Promise<void> => {
    if (!authData?.riderId && authData?.session.access_token) {
      const response = await createRiderProfileApi(
        authData.session.access_token
      );

      if (response.status !== 200 && response.status !== 201) {
        throw new Error(response.message || 'Gagal membuat profil penumpang');
      }

      const { id } = response.data;
      await setAuthData({
        ...authData,
        riderId: id,
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
    <View className="flex-1 bg-white">
      <View className="flex-1 justify-between">
        {/* Header Section */}
        <View>
          <Logo />
        </View>

        {/* Main Content */}
        <View className="px-6">
          <Header firstName={authData?.firstName || ''} />

          {/* Action Buttons */}
          <View className="mx-2 mt-8 space-y-4">
            <ContinueButton onPress={handleContinue} isLoading={isLoading} />
          </View>
        </View>

        {/* Terms and Conditions */}
        <View>
          <Text className="mb-4 px-6 text-center text-sm text-gray-500">
            Dengan melanjutkan, Anda menyetujui Syarat dan Ketentuan kami
          </Text>
        </View>
      </View>
    </View>
  );
}
