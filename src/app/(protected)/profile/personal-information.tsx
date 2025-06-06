import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import {
  Alert,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { AuthContext } from '@/lib/auth';
import { SafeView } from '@/lib/safe-view';
import { type ApiResponse } from '@/types/api';

interface FormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export default function PersonalInformation() {
  const { authData, setAuthData } = useContext(AuthContext);
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: authData?.firstName || '',
    lastName: authData?.lastName || '',
    phoneNumber: authData?.user.phone || '',
  });

  const handleUpdate = async () => {
    if (!formData.firstName.trim()) {
      Alert.alert('Error', 'First name is required');
      return;
    }

    if (!formData.phoneNumber.trim()) {
      Alert.alert('Error', 'Phone number is required');
      return;
    }

    // Validate phone number format
    const phoneRegex = /^62[1-9][0-9]{8,11}$/;
    if (!phoneRegex.test(formData.phoneNumber.trim())) {
      Alert.alert('Error', 'Please enter a valid Indonesian phone number');
      return;
    }

    setIsLoading(true);
    try {
      // Update profile (name)
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
        throw new Error(profileData.message || 'Failed to update profile');
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
            phone: '+' + formData.phoneNumber.trim(),
          }),
        }
      );

      const phoneData: ApiResponse = await phoneResponse.json();

      if (phoneData.status !== 200) {
        throw new Error(phoneData.message || 'Failed to update phone number');
      }

      // Update local state
      if (authData && setAuthData) {
        const updatedAuthData = {
          ...authData,
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim() || null,
          phone: formData.phoneNumber.trim(),
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

      Alert.alert('Success', 'Profile updated successfully');
      setIsEditing(false);
    } catch (error: unknown) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to update profile'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: authData?.firstName || '',
      lastName: authData?.lastName || '',
      phoneNumber: authData?.user.phone || '',
    });
    setIsEditing(false);
  };

  const renderField = (label: string, value: string, field: keyof FormData) => {
    const isPhoneNumber = field === 'phoneNumber';
    const isOptional = field === 'lastName';

    // Helper function to format phone number for display
    const formatPhoneNumber = (phone: string) => {
      return phone.startsWith('+62')
        ? phone.slice(3) // Remove +62
        : phone.startsWith('62')
          ? phone.slice(2) // Remove 62
          : phone;
    };

    // Helper function to format phone number for storage
    const formatPhoneForStorage = (phone: string) => {
      const cleaned = phone.replace(/[^0-9]/g, '');
      return cleaned.startsWith('62') ? cleaned : '62' + cleaned;
    };

    return (
      <View className="mb-4">
        <Text className="mb-1.5 text-sm text-gray-700">
          {label} {isOptional ? '(Optional)' : '*'}
        </Text>
        <View className="flex-row items-center rounded-xl border border-gray-200 bg-gray-50">
          <View className="pl-4 pr-2">
            <Ionicons
              name={
                isPhoneNumber
                  ? 'call'
                  : field === 'lastName'
                    ? 'person-outline'
                    : 'person'
              }
              size={20}
              color="#6B7280"
            />
          </View>
          {isPhoneNumber ? (
            <View className="flex-1 flex-row items-center">
              <View className="border-r border-gray-200 pr-2">
                <Text className="py-3 pl-2 text-gray-900">+62</Text>
              </View>
              {isEditing ? (
                <TextInput
                  className="flex-1 px-3 py-3"
                  placeholder="812 3456 7890"
                  value={formatPhoneNumber(value)}
                  onChangeText={(text) => {
                    const numbersOnly = text.replace(/[^0-9]/g, '');
                    setFormData((prev) => ({
                      ...prev,
                      phoneNumber: formatPhoneForStorage(numbersOnly),
                    }));
                  }}
                  keyboardType="phone-pad"
                  editable={!isLoading}
                  placeholderTextColor="#9CA3AF"
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                  blurOnSubmit={true}
                />
              ) : (
                <Text className="flex-1 px-3 py-3 text-gray-900">
                  {formatPhoneNumber(value)}
                </Text>
              )}
            </View>
          ) : isEditing ? (
            <TextInput
              className="flex-1 px-2 py-3"
              placeholder={`Enter your ${label.toLowerCase()}`}
              value={value}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, [field]: text }))
              }
              autoCapitalize="words"
              editable={!isLoading}
              placeholderTextColor="#9CA3AF"
            />
          ) : (
            <Text className="flex-1 px-2 py-3 text-gray-900">
              {value || 'Not set'}
            </Text>
          )}
        </View>
        {isPhoneNumber && (
          <Text className="mt-1 text-xs text-gray-500">
            Enter your phone number
          </Text>
        )}
      </View>
    );
  };

  return (
    <SafeView>
      <View className="flex-1 bg-white">
        <View className="flex-1 justify-between">
          {/* Top Section */}
          <View>
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-3">
              <TouchableOpacity
                onPress={() => {
                  if (isEditing) {
                    Alert.alert(
                      'Discard Changes',
                      'Are you sure you want to discard your changes?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Discard',
                          style: 'destructive',
                          onPress: () => {
                            handleCancel();
                            router.back();
                          },
                        },
                      ]
                    );
                  } else {
                    router.back();
                  }
                }}
              >
                <Ionicons name="arrow-back" size={24} color="black" />
              </TouchableOpacity>
              <Text className="text-lg font-semibold text-black">
                Personal Information
              </Text>
              <View style={{ width: 24 }} />
            </View>
          </View>

          {/* Main Content - Centered */}
          <View className="px-6">
            {/* Header */}
            <View className="mb-8 items-center">
              <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <Ionicons name="person" size={32} color="#2563EB" />
              </View>
              <Text className="mb-2 text-2xl font-bold text-gray-900">
                {isEditing ? 'Update Your Profile' : 'Profile Information'}
              </Text>
              <Text className="text-center text-base text-gray-600">
                {isEditing
                  ? 'Make changes to your personal information'
                  : 'View your personal information'}
              </Text>
            </View>

            {/* Form */}
            <View className="mx-2 space-y-4">
              {renderField('First Name', formData.firstName, 'firstName')}
              {renderField('Last Name', formData.lastName, 'lastName')}
              {renderField('Phone Number', formData.phoneNumber, 'phoneNumber')}
            </View>

            {/* Buttons */}
            <View className="mx-2 mt-8 space-y-4">
              <TouchableOpacity
                className={`${
                  isLoading ? 'bg-blue-300' : 'bg-blue-600'
                } mb-4 flex-row items-center justify-center rounded-xl py-4`}
                onPress={isEditing ? handleUpdate : () => setIsEditing(true)}
                disabled={isLoading}
              >
                <Ionicons
                  name={isEditing ? 'checkmark' : 'pencil'}
                  size={20}
                  color="white"
                  style={{ marginRight: 8 }}
                />
                <Text className="text-base font-semibold text-white">
                  {isLoading
                    ? 'Updating...'
                    : isEditing
                      ? 'Update Profile'
                      : 'Edit Profile'}
                </Text>
              </TouchableOpacity>

              {isEditing && (
                <TouchableOpacity
                  onPress={handleCancel}
                  disabled={isLoading}
                  className="rounded-xl border border-gray-200 py-4"
                >
                  <Text className="text-center font-medium text-gray-600">
                    Cancel
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Bottom Section */}
          <View>
            <Text className="mb-12 px-6 text-center text-sm text-gray-500">
              Your information is securely stored
            </Text>
          </View>
        </View>
      </View>
    </SafeView>
  );
}
