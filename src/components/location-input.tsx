import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

export interface LocationInputProps {
  label: string;
  value: string;
  placeholder: string;
  isEditing: boolean;
  isHighlighted: boolean;
  onPress: () => void;
  onChangeText: (text: string) => void;
  onClear: () => void;
  onSubmitEditing?: () => void;
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  blurOnSubmit?: boolean;
  isLoading?: boolean;
  customInputStyle?: string;
  customLabelStyle?: string;
}

export default function LocationInput({
  label,
  value,
  placeholder,
  isEditing,
  isHighlighted,
  onPress,
  onChangeText,
  onClear,
  isLoading,
  customInputStyle,
  customLabelStyle,
}: LocationInputProps) {
  return (
    <View>
      {label && (
        <Text
          className={customLabelStyle || 'text-xs font-medium text-gray-500'}
        >
          {label}
        </Text>
      )}
      {isEditing ? (
        <View className="relative">
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            className={customInputStyle || 'rounded-lg bg-gray-100 px-4 py-3'}
            autoFocus
          />
          {value.length > 0 && (
            <TouchableOpacity
              onPress={onClear}
              className="absolute right-3 top-3"
            >
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <TouchableOpacity
          onPress={onPress}
          className={
            customInputStyle ||
            `rounded-lg bg-gray-100 px-4 py-3 ${
              isHighlighted ? 'border-2 border-blue-500' : ''
            }`
          }
        >
          <Text
            className={`${value ? 'text-gray-900' : 'text-gray-500'} ${
              isLoading ? 'opacity-50' : ''
            }`}
            numberOfLines={1}
          >
            {value || placeholder}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
