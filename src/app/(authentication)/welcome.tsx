import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Welcome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 bg-white"
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <View className="flex-1 px-6">
        {/* Main Content - Using flex-1 to take remaining space */}
        <View className="flex-1 items-center justify-center">
          {/* Logo Section */}
          <View className="mb-8 items-center">
            <View className="flex-row items-center">
              <View className="mr-2 h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
                <Ionicons name="car" size={30} color="white" />
              </View>
              <Text className="text-2xl font-bold text-blue-600">TripNus</Text>
            </View>
          </View>

          {/* Illustration */}
          <View className="items-center">
            <Image
              source={{
                uri: 'https://placehold.co/400x400/4F46E5/ffffff?text=City+Traffic',
              }}
              className="aspect-square w-full"
              contentFit="contain"
            />
          </View>

          {/* Text Content */}
          <View className="mt-8 items-center">
            <Text className="mb-4 text-center text-3xl font-bold text-gray-900">
              Your Reliable Ride Partner
            </Text>
            <Text className="text-center text-base text-gray-600">
              Fast, safe and comfortable rides at your fingertips. Join us
              today!
            </Text>
          </View>
        </View>

        {/* Bottom Section */}
        <View className="mb-4 space-y-8">
          {/* Buttons */}
          <View className="space-y-6">
            <TouchableOpacity
              className="mb-6 items-center rounded-xl bg-blue-600 py-4"
              onPress={() => router.push('/register')}
            >
              <Text className="text-base font-semibold text-white">
                Get Started
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="mb-16 items-center rounded-xl border border-blue-600 py-4"
              onPress={() => router.push('/login')}
            >
              <Text className="text-base font-semibold text-blue-600">
                I already have an account
              </Text>
            </TouchableOpacity>
          </View>

          {/* Features */}
          <View className="mb-12 flex-row justify-center gap-16">
            <View className="items-center">
              <View className="mb-2 h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Ionicons name="time" size={20} color="#2563EB" />
              </View>
              <Text className="text-sm text-gray-700">Fast Pickup</Text>
            </View>

            <View className="items-center">
              <View className="mb-2 h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Ionicons name="shield-checkmark" size={20} color="#2563EB" />
              </View>
              <Text className="text-sm text-gray-700">Safe Rides</Text>
            </View>

            <View className="items-center">
              <View className="mb-2 h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Ionicons name="star" size={20} color="#2563EB" />
              </View>
              <Text className="text-sm text-gray-700">Top Rated</Text>
            </View>
          </View>

          {/* Terms */}
          <Text className="text-center text-sm text-gray-500">
            By continuing, you agree to our Terms of Service
          </Text>
        </View>
      </View>
    </View>
  );
}
