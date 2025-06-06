import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Keyboard, Text, TextInput, View } from 'react-native';

type Props = {
  label: string;
  value: string;
  field: 'firstName' | 'lastName' | 'phoneNumber';
  isEditing: boolean;
  isLoading: boolean;
  onChange: (value: string) => void;
}

export function PersonalInformationField({
  label,
  value,
  field,
  isEditing,
  isLoading,
  onChange,
}: Props) {
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
        {label} {isOptional ? '(Opsional)' : '*'}
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
                  onChange(formatPhoneForStorage(numbersOnly));
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
            placeholder={`Masukkan ${label.toLowerCase()}`}
            value={value}
            onChangeText={onChange}
            autoCapitalize="words"
            editable={!isLoading}
            placeholderTextColor="#9CA3AF"
          />
        ) : (
          <Text className="flex-1 px-2 py-3 text-gray-900">
            {value || 'Belum diatur'}
          </Text>
        )}
      </View>
      {isPhoneNumber && (
        <Text className="mt-1 text-xs text-gray-500">
          Masukkan nomor telepon Anda
        </Text>
      )}
    </View>
  );
}
