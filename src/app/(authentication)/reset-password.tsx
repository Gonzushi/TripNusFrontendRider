import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import { AuthContext } from '@/lib/auth';

// Types
type PasswordRequirement = {
  label: string;
  regex: RegExp;
  met: boolean;
};

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
        <Ionicons name="lock-open" size={32} color="#2563EB" />
      </View>
      <Text className="mb-2 text-2xl font-bold text-gray-900">
        Reset Password
      </Text>
      <Text className="text-center text-base text-gray-600">
        Silakan atur kata sandi baru untuk akun Anda{'\n'}
        {email}
      </Text>
    </View>
  );
}

// Password input component
function PasswordInput({
  value,
  onChangeText,
  isLoading,
}: {
  value: string;
  onChangeText: (text: string) => void;
  isLoading: boolean;
}) {
  return (
    <View className="mb-4">
      <Text className="mb-1.5 text-sm text-gray-700">Kata Sandi Baru</Text>
      <View className="flex-row items-center rounded-xl border border-gray-200 bg-gray-50">
        <View className="pl-4 pr-2">
          <Ionicons name="lock-closed" size={20} color="#6B7280" />
        </View>
        <TextInput
          className="flex-1 px-2 py-3"
          placeholder="Masukkan kata sandi baru Anda"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry
          editable={!isLoading}
          placeholderTextColor="#9CA3AF"
        />
      </View>
    </View>
  );
}

// Password requirements component
function PasswordRequirements({
  requirements,
}: {
  requirements: PasswordRequirement[];
}) {
  return (
    <View className="mb-4">
      <Text className="mb-3 text-sm font-medium text-gray-700">
        Persyaratan Kata Sandi:
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

// Reset button component
function ResetButton({
  onPress,
  isDisabled,
  isLoading,
}: {
  onPress: () => void;
  isDisabled: boolean;
  isLoading: boolean;
}) {
  return (
    <TouchableOpacity
      className={`${
        isDisabled ? 'bg-gray-300' : 'bg-blue-600'
      } mb-4 flex-row items-center justify-center rounded-xl py-4`}
      onPress={onPress}
      disabled={isDisabled}
    >
      <Ionicons
        name="lock-closed"
        size={20}
        color="white"
        style={{ marginRight: 8 }}
      />
      <Text className="text-base font-semibold text-white">
        {isLoading ? 'Mengatur Ulang Kata Sandi...' : 'Atur Ulang Kata Sandi'}
      </Text>
    </TouchableOpacity>
  );
}

export default function ResetPassword() {
  const { changePassword } = useContext(AuthContext);
  const params = useLocalSearchParams();

  // Extract parameters from URL
  const [urlParams] = useState(() => {
    try {
      const type = params.type as string;
      const tokenHash = params.tokenHash as string;
      const dataStr = decodeURIComponent(params.data as string);
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

  // Password requirements with translated labels
  const [requirements, setRequirements] = useState<PasswordRequirement[]>([
    {
      label: 'Minimal 6 karakter',
      regex: /^.{6,}$/,
      met: false,
    },
    {
      label: 'Mengandung huruf kecil (a-z)',
      regex: /[a-z]/,
      met: false,
    },
    {
      label: 'Mengandung huruf besar (A-Z)',
      regex: /[A-Z]/,
      met: false,
    },
    {
      label: 'Mengandung angka (0-9)',
      regex: /[0-9]/,
      met: false,
    },
    {
      label: 'Mengandung karakter khusus (!@#$%^&*)',
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
      router.replace('/login');
      return;
    }

    setIsLoading(true);
    try {
      await changePassword(urlParams.type, urlParams.tokenHash, password);
    } catch {
      if (router.canDismiss()) {
        router.dismissAll();
      }
      router.replace('/welcome');
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
          <Header email={urlParams.email} />

          {/* Form */}
          <View className="mx-2 space-y-4">
            <PasswordInput
              value={password}
              onChangeText={setPassword}
              isLoading={isLoading}
            />
            <PasswordRequirements requirements={requirements} />
          </View>

          {/* Action Buttons */}
          <View className="mx-2 mt-8 space-y-4">
            <ResetButton
              onPress={handleResetPassword}
              isDisabled={!allRequirementsMet || isLoading}
              isLoading={isLoading}
            />

            <Divider />

            <TouchableOpacity
              className="items-center rounded-xl py-4"
              onPress={() => router.replace('/login')}
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
