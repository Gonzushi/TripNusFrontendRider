import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthContext } from '@/lib/auth';

export default function Login() {
  const { logIn } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await logIn(email, password);
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
              <Ionicons name="log-in" size={32} color="#2563EB" />
            </View>
            <Text className="mb-2 text-2xl font-bold text-gray-900">
              Welcome Back
            </Text>
            <Text className="text-center text-base text-gray-600">
              Log in to your account to continue your journey
            </Text>
          </View>

          {/* Form */}
          <View className="mx-2 space-y-4">
            {/* Email Input */}
            <View className="mb-4">
              <Text className="mb-1.5 text-sm text-gray-700">Email</Text>
              <View className="flex-row items-center rounded-xl border border-gray-200 bg-gray-50">
                <View className="pl-4 pr-2">
                  <Ionicons name="mail" size={20} color="#6B7280" />
                </View>
                <TextInput
                  className="flex-1 px-2 py-3"
                  placeholder="you@email.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Password Input */}
            <View className="mb-4">
              <Text className="mb-1.5 text-sm text-gray-700">Password</Text>
              <View className="flex-row items-center rounded-xl border border-gray-200 bg-gray-50">
                <View className="pl-4 pr-2">
                  <Ionicons name="lock-closed" size={20} color="#6B7280" />
                </View>
                <TextInput
                  className="flex-1 px-2 py-3"
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!isLoading}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              onPress={() => router.push('/forgot-password')}
              className="mb-4 items-end"
            >
              <Text className="text-sm font-medium text-blue-600">
                Forgot Password?
              </Text>
            </TouchableOpacity>
          </View>

          {/* Buttons */}
          <View className="mx-2 mt-8 space-y-4">
            <TouchableOpacity
              className={`${
                isLoading ? 'bg-blue-300' : 'bg-blue-600'
              } mb-4 flex-row items-center justify-center rounded-xl py-4`}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Ionicons
                name="log-in"
                size={20}
                color="white"
                style={{ marginRight: 8 }}
              />
              <Text className="text-base font-semibold text-white">
                {isLoading ? 'Logging in...' : 'Log In'}
              </Text>
            </TouchableOpacity>

            <View className="my-4 flex-row items-center justify-center">
              <View className="h-[1px] flex-1 bg-gray-200" />
              <Text className="mx-4 text-gray-500">or</Text>
              <View className="h-[1px] flex-1 bg-gray-200" />
            </View>

            <TouchableOpacity
              className="items-center rounded-xl py-4"
              onPress={() => router.replace('/register')}
            >
              <Text className="text-base font-semibold text-blue-600">
                Create a new account
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
