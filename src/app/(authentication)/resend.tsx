import { AuthContext } from '@/lib/auth';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ResendActivation() {
  const { email } = useLocalSearchParams();
  const router = useRouter();
  const { resendActivation } = useContext(AuthContext);
  const [countdown, setCountdown] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const maxAttempts = 3;
  const insets = useSafeAreaInsets();

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

  const handleResend = async () => {
    if (attempts >= maxAttempts) {
      Alert.alert(
        'Maximum Attempts Reached',
        'Please try again later or contact support.',
        [
          {
            text: 'Back to Login',
            onPress: () => router.back(),
          },
        ]
      );
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
              <Ionicons name="mail-unread" size={32} color="#2563EB" />
            </View>
            <Text className="text-2xl font-bold text-gray-900 mb-2">
              Activate Your Account
            </Text>
            <Text className="text-base text-gray-600 text-center">
              Your email {email} needs to be verified. Click the button below to
              send an activation link to your email.
            </Text>
          </View>

          {/* Buttons */}
          <View className="mt-8 space-y-4 mx-2">
            <TouchableOpacity
              className={`${
                countdown > 0 || attempts >= maxAttempts || isLoading
                  ? 'bg-gray-300'
                  : 'bg-blue-600'
              } py-4 rounded-xl items-center flex-row justify-center mb-4`}
              onPress={handleResend}
              disabled={countdown > 0 || attempts >= maxAttempts || isLoading}
            >
              <Ionicons
                name="mail"
                size={20}
                color="white"
                style={{ marginRight: 8 }}
              />
              <Text className="text-white font-semibold text-base">
                {isLoading
                  ? 'Sending...'
                  : countdown > 0
                    ? `Resend in ${countdown}s`
                    : attempts >= maxAttempts
                      ? 'Maximum attempts reached'
                      : 'Resend Activation Email'}
              </Text>
            </TouchableOpacity>

            <Text className="text-sm text-gray-500 text-center mt-4">
              {maxAttempts - attempts} attempts remaining
            </Text>

            <View className="flex-row items-center justify-center my-4">
              <View className="flex-1 h-[1px] bg-gray-200" />
              <Text className="mx-4 text-gray-500">or</Text>
              <View className="flex-1 h-[1px] bg-gray-200" />
            </View>

            <TouchableOpacity
              className="py-4 rounded-xl items-center"
              onPress={() => router.back()}
              disabled={isLoading}
            >
              <Text className="text-blue-600 font-semibold text-base">
                Back to Login
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
