import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthContext } from '@/lib/auth';

interface PasswordRequirement {
  label: string;
  regex: RegExp;
  met: boolean;
}

export default function ResetPassword() {
  const { changePassword } = useContext(AuthContext);
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  // Extract parameters from URL
  const [urlParams] = useState(() => {
    try {
      // Get type and tokenHash directly from params
      const type = params.type as string;
      const tokenHash = params.tokenHash as string;

      // Parse the data parameter which is URL encoded
      const dataStr = decodeURIComponent(params.data as string);
      // Remove 'map[' prefix and ']' suffix and extract email
      const cleanDataStr = dataStr.replace(/^map\[|\]$/g, '');
      const emailMatch = cleanDataStr.match(/email:(.*?)\s/);
      const email = emailMatch?.[1] || '';

      return { type, tokenHash, email };
    } catch (error) {
      console.error('Error parsing URL parameters:', error);
      return { type: '', tokenHash: '', email: '' };
    }
  });

  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  const handleResetPassword = async () => {
    if (!urlParams.type || !urlParams.tokenHash) {
      Alert.alert('Error', 'Invalid reset password link', [
        { text: 'OK', onPress: () => router.replace('/login') },
      ]);
      return;
    }

    setIsLoading(true);
    try {
      await changePassword(urlParams.type, urlParams.tokenHash, password);
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'An unexpected error occurred',
        [
          {
            text: 'OK',
            onPress: () => {
              if (router.canDismiss()) {
                router.dismissAll();
              }
              router.replace('/welcome');
            },
          },
        ]
      );
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
              <Ionicons name="lock-open" size={32} color="#2563EB" />
            </View>
            <Text className="mb-2 text-2xl font-bold text-gray-900">
              Reset Password
            </Text>
            <Text className="text-center text-base text-gray-600">
              Please set a new password for your account{'\n'}
              {urlParams.email}
            </Text>
          </View>

          {/* Form */}
          <View className="mx-2 space-y-4">
            {/* Password Input */}
            <View className="mb-4">
              <Text className="mb-1.5 text-sm text-gray-700">New Password</Text>
              <View className="flex-row items-center rounded-xl border border-gray-200 bg-gray-50">
                <View className="pl-4 pr-2">
                  <Ionicons name="lock-closed" size={20} color="#6B7280" />
                </View>
                <TextInput
                  className="flex-1 px-2 py-3"
                  placeholder="Enter your new password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!isLoading}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Password Requirements */}
            <View className="mb-4">
              <Text className="mb-3 text-sm font-medium text-gray-700">
                Password Requirements:
              </Text>
              {requirements.map((req, index) => (
                <View key={index} className="mb-2 flex-row items-center">
                  <Ionicons
                    name={req.met ? 'checkmark-circle' : 'close-circle'}
                    size={20}
                    color={req.met ? '#10B981' : '#EF4444'}
                  />
                  <Text
                    className={`ml-2 text-sm ${
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
                !allRequirementsMet || isLoading ? 'bg-gray-300' : 'bg-blue-600'
              } mb-4 flex-row items-center justify-center rounded-xl py-4`}
              onPress={handleResetPassword}
              disabled={!allRequirementsMet || isLoading}
            >
              <Ionicons
                name="lock-closed"
                size={20}
                color="white"
                style={{ marginRight: 8 }}
              />
              <Text className="text-base font-semibold text-white">
                {isLoading ? 'Resetting Password...' : 'Reset Password'}
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
                Back to Login
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
