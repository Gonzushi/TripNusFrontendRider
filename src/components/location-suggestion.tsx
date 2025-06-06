import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface LocationSuggestionProps {
  title: string;
  address: string;
  type: 'api' | 'recent' | 'popular';
  onPress: () => void;
}

type IconName = ComponentProps<typeof Ionicons>['name'];

export default function LocationSuggestion({
  title,
  address,
  type,
  onPress,
}: LocationSuggestionProps) {
  const getIconProps = (): {
    name: IconName;
    bgColor: string;
    iconColor: string;
  } => {
    switch (type) {
      case 'api':
        return {
          name: 'location',
          bgColor: 'bg-green-100',
          iconColor: '#10B981',
        };
      case 'recent':
        return {
          name: 'time',
          bgColor: 'bg-blue-100',
          iconColor: '#3B82F6',
        };
      default:
        return {
          name: 'star',
          bgColor: 'bg-purple-100',
          iconColor: '#8B5CF6',
        };
    }
  };

  const { name, bgColor, iconColor } = getIconProps();

  return (
    <TouchableOpacity
      className="flex-row items-center border-b border-gray-100 px-4 py-4 active:bg-gray-50"
      onPress={onPress}
    >
      <View
        className={`mr-3 h-10 w-10 items-center justify-center rounded-full ${bgColor}`}
      >
        <Ionicons name={name} size={20} color={iconColor} />
      </View>
      <View>
        <Text className="font-medium text-gray-800">{title}</Text>
        <Text className="text-sm text-gray-500">{address}</Text>
      </View>
    </TouchableOpacity>
  );
}
