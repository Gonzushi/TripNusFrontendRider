import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import { AuthContext } from '@/lib/auth';

function Logo() {
  return (
    <View>
      <View className="mt-6 items-center">
        <View className="flex-row items-center">
          <View className="mr-2 h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
            <Ionicons name="car" size={30} color="white" />
          </View>
          <Text className="text-2xl font-bold text-blue-600">TripNus</Text>
        </View>
      </View>
    </View>
  );
}

export default function ForgotPassword() {
  const { forgotPassword } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await forgotPassword(email);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <View className="flex-1 justify-between">
        {/* Header Section */}
        <Logo />

        {/* Main Content */}
        <View className="px-6">
          {/* Title */}
          <View className="mb-8 items-center">
            <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <Ionicons name="key" size={32} color="#2563EB" />
            </View>
            <Text className="mb-2 text-2xl font-bold text-gray-900">
              Lupa Kata Sandi?
            </Text>
            <Text className="text-center text-base text-gray-600">
              Masukkan email Anda untuk menerima instruksi pengaturan ulang kata
              sandi
            </Text>
          </View>

          {/* Form */}
          <View className="mx-2 space-y-4">
            <View className="mb-4">
              <Text className="mb-1.5 text-sm text-gray-700">Email</Text>
              <View className="flex-row items-center rounded-xl border border-gray-200 bg-gray-50">
                <View className="pl-4 pr-2">
                  <Ionicons name="mail" size={20} color="#6B7280" />
                </View>
                <TextInput
                  className="flex-1 px-2 py-3"
                  placeholder="anda@email.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="mx-2 mt-8 space-y-4">
            <TouchableOpacity
              className={`${
                isLoading ? 'bg-blue-300' : 'bg-blue-600'
              } mb-4 flex-row items-center justify-center rounded-xl py-4`}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <Ionicons
                name="send"
                size={20}
                color="white"
                style={{ marginRight: 8 }}
              />
              <Text className="text-base font-semibold text-white">
                {isLoading ? 'Mengirim...' : 'Kirim Instruksi'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="items-center rounded-xl py-4"
              onPress={() => router.back()}
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
