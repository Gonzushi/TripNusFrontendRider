import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

type FeatureItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
};

function FeatureItem({ icon, label }: FeatureItemProps) {
  return (
    <View className="items-center">
      <View className="mb-2 h-12 w-12 items-center justify-center rounded-full bg-blue-100">
        <Ionicons name={icon} size={20} color="#2563EB" />
      </View>
      <Text className="text-sm text-gray-700">{label}</Text>
    </View>
  );
}

export default function Welcome() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white">
      <View className="flex-1 px-6">
        {/* Main Content */}
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
              Partner Perjalanan Terpercaya Anda
            </Text>
            <Text className="text-center text-base text-gray-600">
              Perjalanan cepat, aman, dan nyaman dalam genggaman Anda.
              Bergabunglah sekarang!
            </Text>
          </View>
        </View>

        {/* Bottom Section */}
        <View className="mb-4 space-y-8">
          {/* Buttons */}
          <View className="space-y-6">
            <TouchableOpacity
              className="mb-6 items-center rounded-xl bg-blue-600 py-4"
              onPress={() => router.push('/login')}
            >
              <Text className="text-base font-semibold text-white">
                Saya sudah punya akun
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="mb-16 items-center rounded-xl border border-blue-600 py-4"
              onPress={() => router.push('/register')}
            >
              <Text className="text-base font-semibold text-blue-600">
                Mulai Sekarang
              </Text>
            </TouchableOpacity>
          </View>

          {/* Features */}
          <View className="mb-12 flex-row justify-center gap-16">
            <FeatureItem icon="time" label="Penjemputan Cepat" />
            <FeatureItem icon="shield-checkmark" label="Perjalanan Aman" />
            <FeatureItem icon="star" label="Rating Tinggi" />
          </View>

          {/* Terms */}
          <Text className="text-center text-sm text-gray-500">
            Dengan melanjutkan, Anda menyetujui Syarat dan Ketentuan kami
          </Text>
        </View>
      </View>
    </View>
  );
}
