import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthContext } from '@/lib/auth';

interface PasswordRequirement {
  label: string;
  regex: RegExp;
  met: boolean;
}

export default function Register() {
  const { register } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [requirements, setRequirements] = useState<PasswordRequirement[]>([
    {
      label: 'At least 6 characters long',
      regex: /^.{6,}$/,
      met: false,
    },
    {
      label: 'Contains lowercase letter (a-z)',
      regex: /[a-z]/,
      met: false,
    },
    {
      label: 'Contains uppercase letter (A-Z)',
      regex: /[A-Z]/,
      met: false,
    },
    {
      label: 'Contains number (0-9)',
      regex: /[0-9]/,
      met: false,
    },
    {
      label: 'Contains special character (!@#$%^&*()_+-=[]{};\\\':"|<>?,./`~)',
      regex: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?`~]/,
      met: false,
    },
  ]);

  // Check password requirements whenever password changes
  useEffect(() => {
    setRequirements((prev) =>
      prev.map((req) => ({
        ...req,
        met: req.regex.test(password),
      }))
    );
  }, [password]);

  const allRequirementsMet = requirements.every((req) => req.met);

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      await register(email, password);
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
              <Ionicons name="person-add" size={32} color="#2563EB" />
            </View>
            <Text className="mb-2 text-2xl font-bold text-gray-900">
              Create Account
            </Text>
            <Text className="text-center text-base text-gray-600">
              Join TripNus and enjoy fast, safe, and reliable rides.
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

            {/* Password Requirements */}
            <View className="rounded-xl bg-gray-50 p-4">
              <Text className="mb-2 text-sm font-medium text-gray-700">
                Password Requirements:
              </Text>
              {requirements.map((req, index) => (
                <View key={index} className="mb-1.5 flex-row items-center">
                  <Ionicons
                    name={req.met ? 'checkmark-circle' : 'close-circle'}
                    size={16}
                    color={req.met ? '#10B981' : '#EF4444'}
                  />
                  <Text
                    className={`ml-2 text-xs ${
                      req.met ? 'text-green-600' : 'text-gray-600'
                    }`}
                  >
                    {req.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Buttons */}
          <View className="mx-2 mt-8 space-y-4">
            <TouchableOpacity
              className={`${
                !allRequirementsMet || isLoading ? 'bg-blue-300' : 'bg-blue-600'
              } mb-4 flex-row items-center justify-center rounded-xl py-4`}
              onPress={handleRegister}
              disabled={!allRequirementsMet || isLoading}
            >
              <Ionicons
                name="person-add"
                size={20}
                color="white"
                style={{ marginRight: 8 }}
              />
              <Text className="text-base font-semibold text-white">
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            <View className="my-4 flex-row items-center justify-center">
              <View className="h-[1px] flex-1 bg-gray-200" />
              <Text className="mx-4 text-gray-500">or</Text>
              <View className="h-[1px] flex-1 bg-gray-200" />
            </View>

            <TouchableOpacity
              className="items-center rounded-xl py-4"
              onPress={() => router.replace('/login')}
            >
              <Text className="text-base font-semibold text-blue-600">
                Already have an account?
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
