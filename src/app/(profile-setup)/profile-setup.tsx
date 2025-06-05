import { AuthContext } from '@/lib/auth';
import { ApiResponse } from '@/types/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Component interfaces
interface ProfileFormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export default function ProfileSetup() {
  // State
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    phoneNumber: '+62',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Hooks
  const { authData, setAuthData, logOut } = useContext(AuthContext);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Effects
  useEffect(() => {
    if (authData?.firstName) {
      router.replace('/profile-success');
    }
  }, [authData]);

  // API Calls
  const updateUserProfile = async (): Promise<void> => {
    if (!formData.firstName.trim()) {
      throw new Error('First name is required');
    }

    if (!formData.phoneNumber.trim()) {
      throw new Error('Phone number is required');
    }

    // Validate phone number format
    const phoneRegex = /^\+62[1-9][0-9]{8,11}$/;
    if (!phoneRegex.test(formData.phoneNumber.trim())) {
      throw new Error(
        'Please enter a valid Indonesian phone number starting with +62'
      );
    }

    // Update profile
    const profileResponse = await fetch(
      'https://rest.trip-nus.com/user/profile',
      {
        method: 'PATCH',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${authData?.session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim() || undefined,
        }),
      }
    );

    const profileData: ApiResponse = await profileResponse.json();

    if (profileData.status !== 200) {
      throw new Error(profileData.message || 'Failed to update user profile');
    }

    // Update phone number
    const phoneResponse = await fetch(
      'https://rest.trip-nus.com/auth/update-phone',
      {
        method: 'POST',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${authData?.session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: formData.phoneNumber.trim(),
        }),
      }
    );

    const phoneData: ApiResponse = await phoneResponse.json();

    if (phoneData.status !== 200) {
      throw new Error(phoneData.message || 'Failed to update phone number');
    }

    // Update auth data with both profile and phone updates
    if (authData) {
      const updatedAuthData = {
        ...authData,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim() || null,
        user: {
          ...authData.user,
          phone: formData.phoneNumber.trim(),
        },
        session: {
          ...authData.session,
          user: {
            ...authData.session.user,
            phone: formData.phoneNumber.trim(),
          },
        },
      };
      await setAuthData(updatedAuthData);
    }
  };

  // Event Handlers
  const handleError = async (error: Error) => {
    if (
      error.message === 'First name is required' ||
      error.message === 'Phone number is required' ||
      error.message.includes('valid Indonesian phone number')
    ) {
      Alert.alert('Error', error.message);
      return;
    }
    await logOut();
    router.replace('/welcome');
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await updateUserProfile();
      router.replace('/profile-success');
    } catch (error) {
      await handleError(error as Error);
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
              <Ionicons name="person" size={32} color="#2563EB" />
            </View>
            <Text className="text-2xl font-bold text-gray-900 mb-2">
              Complete Your Profile
            </Text>
            <Text className="text-base text-gray-600 text-center">
              Please provide your name to continue using TripNus
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-4 mx-2">
            {/* First Name Input */}
            <View className="mb-4">
              <Text className="text-sm text-gray-700 mb-1.5">First Name *</Text>
              <View className="flex-row items-center bg-gray-50 rounded-xl border border-gray-200">
                <View className="pl-4 pr-2">
                  <Ionicons name="person" size={20} color="#6B7280" />
                </View>
                <TextInput
                  className="flex-1 py-3 px-2"
                  placeholder="Enter your first name"
                  value={formData.firstName}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, firstName: text }))
                  }
                  autoCapitalize="words"
                  editable={!isLoading}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Last Name Input */}
            <View className="mb-4">
              <Text className="text-sm text-gray-700 mb-1.5">
                Last Name (Optional)
              </Text>
              <View className="flex-row items-center bg-gray-50 rounded-xl border border-gray-200">
                <View className="pl-4 pr-2">
                  <Ionicons name="person-outline" size={20} color="#6B7280" />
                </View>
                <TextInput
                  className="flex-1 py-3 px-2"
                  placeholder="Enter your last name"
                  value={formData.lastName}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, lastName: text }))
                  }
                  autoCapitalize="words"
                  editable={!isLoading}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Phone Number Input */}
            <View className="mb-4">
              <Text className="text-sm text-gray-700 mb-1.5">
                Phone Number *
              </Text>
              <View className="flex-row items-center bg-gray-50 rounded-xl border border-gray-200">
                <View className="pl-4 pr-2">
                  <Ionicons name="call" size={20} color="#6B7280" />
                </View>
                <View className="flex-row items-center flex-1">
                  <Text className="text-gray-900 pl-2">+62</Text>
                  <TextInput
                    className="flex-1 py-3 px-2"
                    placeholder="812XXXXXXXX"
                    value={formData.phoneNumber.replace('+62', '')}
                    onChangeText={(text) => {
                      // Only allow numbers
                      const numbersOnly = text.replace(/[^0-9]/g, '');
                      setFormData((prev) => ({
                        ...prev,
                        phoneNumber: '+62' + numbersOnly,
                      }));
                    }}
                    keyboardType="phone-pad"
                    editable={!isLoading}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>
              <Text className="text-xs text-gray-500 mt-1">
                Format: +62812XXXXXXXX
              </Text>
            </View>
          </View>

          {/* Buttons */}
          <View className="mt-8 space-y-4 mx-2">
            <TouchableOpacity
              className={`${
                isLoading ? 'bg-blue-300' : 'bg-blue-600'
              } py-4 rounded-xl items-center flex-row justify-center mb-4`}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <Ionicons
                name="arrow-forward"
                size={20}
                color="white"
                style={{ marginRight: 8 }}
              />
              <Text className="text-white font-semibold text-base">
                {isLoading ? 'Setting up...' : 'Continue'}
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
