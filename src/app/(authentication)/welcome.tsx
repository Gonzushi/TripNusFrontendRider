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
        <View className="flex-1 justify-center items-center">
          {/* Logo Section */}
          <View className="items-center mb-8">
            <View className="flex-row items-center">
              <View className="bg-blue-600 w-12 h-12 rounded-xl items-center justify-center mr-2">
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
              className="w-full aspect-square"
              contentFit="contain"
            />
          </View>

          {/* Text Content */}
          <View className="items-center mt-8">
            <Text className="text-3xl font-bold text-gray-900 text-center mb-4">
              Your Reliable Ride Partner
            </Text>
            <Text className="text-base text-gray-600 text-center">
              Fast, safe and comfortable rides at your fingertips. Join us
              today!
            </Text>
          </View>
        </View>

        {/* Bottom Section */}
        <View className="space-y-8 mb-4">
          {/* Buttons */}
          <View className="space-y-6">
            <TouchableOpacity
              className="bg-blue-600 py-4 rounded-xl items-center mb-6"
              onPress={() => router.push('/register')}
            >
              <Text className="text-white font-semibold text-base">
                Get Started
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="py-4 rounded-xl items-center border border-blue-600 mb-16"
              onPress={() => router.push('/login')}
            >
              <Text className="text-blue-600 font-semibold text-base">
                I already have an account
              </Text>
            </TouchableOpacity>
          </View>

          {/* Features */}
          <View className="flex-row justify-center gap-16 mb-12">
            <View className="items-center">
              <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mb-2">
                <Ionicons name="time" size={20} color="#2563EB" />
              </View>
              <Text className="text-sm text-gray-700">Fast Pickup</Text>
            </View>

            <View className="items-center">
              <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mb-2">
                <Ionicons name="shield-checkmark" size={20} color="#2563EB" />
              </View>
              <Text className="text-sm text-gray-700">Safe Rides</Text>
            </View>

            <View className="items-center">
              <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mb-2">
                <Ionicons name="star" size={20} color="#2563EB" />
              </View>
              <Text className="text-sm text-gray-700">Top Rated</Text>
            </View>
          </View>

          {/* Terms */}
          <Text className="text-sm text-gray-500 text-center">
            By continuing, you agree to our Terms of Service
          </Text>
        </View>
      </View>
    </View>
  );
}
