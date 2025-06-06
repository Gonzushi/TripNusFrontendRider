import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { AuthContext } from '@/lib/auth';

// App logo component with TripNus branding
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

// Header component with title and description
function Header({ email }: { email: string }) {
  return (
    <View className="mb-8 items-center">
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-blue-100">
        <Ionicons name="mail-unread" size={32} color="#2563EB" />
      </View>
      <Text className="mb-2 text-2xl font-bold text-gray-900">
        Aktivasi Akun Anda
      </Text>
      <Text className="text-center text-base text-gray-600">
        Email {email} perlu diverifikasi. Klik tombol di bawah untuk mengirim
        link aktivasi ke email Anda.
      </Text>
    </View>
  );
}

// Divider component with text
function Divider() {
  return (
    <View className="my-4 flex-row items-center justify-center">
      <View className="h-[1px] flex-1 bg-gray-200" />
      <Text className="mx-4 text-gray-500">atau</Text>
      <View className="h-[1px] flex-1 bg-gray-200" />
    </View>
  );
}

// Resend button component
function ResendButton({
  onPress,
  isDisabled,
  isLoading,
  countdown,
  attempts,
  maxAttempts,
}: {
  onPress: () => void;
  isDisabled: boolean;
  isLoading: boolean;
  countdown: number;
  attempts: number;
  maxAttempts: number;
}) {
  // Get button text based on state
  const getButtonText = () => {
    if (isLoading) return 'Mengirim...';
    if (countdown > 0) return `Kirim ulang dalam ${countdown} detik`;
    if (attempts >= maxAttempts) return 'Batas maksimum percobaan tercapai';
    return 'Kirim Ulang Email Aktivasi';
  };

  return (
    <TouchableOpacity
      className={`${
        isDisabled ? 'bg-gray-300' : 'bg-blue-600'
      } mb-4 flex-row items-center justify-center rounded-xl py-4`}
      onPress={onPress}
      disabled={isDisabled}
    >
      <Ionicons
        name="mail"
        size={20}
        color="white"
        style={{ marginRight: 8 }}
      />
      <Text className="text-base font-semibold text-white">
        {getButtonText()}
      </Text>
    </TouchableOpacity>
  );
}

export default function ResendActivation() {
  const { email } = useLocalSearchParams();
  const router = useRouter();
  const { resendActivation } = useContext(AuthContext);
  const [countdown, setCountdown] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const maxAttempts = 3;

  // Handle countdown timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);

  // Handle resend activation email
  const handleResend = async () => {
    if (attempts >= maxAttempts) {
      router.back();
      return;
    }

    setIsLoading(true);
    try {
      const success = await resendActivation(email as string);
      if (success) {
        setAttempts((prev) => prev + 1);
        setCountdown(10);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isButtonDisabled =
    countdown > 0 || attempts >= maxAttempts || isLoading;

  return (
    <View className="flex-1 bg-white">
      <View className="flex-1 justify-between">
        {/* Header Section */}
        <View>
          <Logo />
        </View>

        {/* Main Content */}
        <View className="px-6">
          <Header email={email as string} />

          {/* Action Buttons */}
          <View className="mx-2 mt-8 space-y-4">
            <ResendButton
              onPress={handleResend}
              isDisabled={isButtonDisabled}
              isLoading={isLoading}
              countdown={countdown}
              attempts={attempts}
              maxAttempts={maxAttempts}
            />

            <Text className="mt-4 text-center text-sm text-gray-500">
              {maxAttempts - attempts} percobaan tersisa
            </Text>

            <Divider />

            <TouchableOpacity
              className="items-center rounded-xl py-4"
              onPress={() => router.back()}
              disabled={isLoading}
            >
              <Text className="text-base font-semibold text-blue-600">
                Kembali ke Login
              </Text>
            </TouchableOpacity>
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
