import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

interface CurrentLocationButtonProps {
  onPress: () => void;
  isLoading?: boolean;
}

export default function CurrentLocationButton({
  onPress,
  isLoading = false,
}: CurrentLocationButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center border-b border-t border-gray-100 bg-white px-4 py-3 active:bg-gray-50"
    >
      <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-blue-50">
        <Ionicons name="locate" size={20} color="#3B82F6" />
      </View>
      <View className="flex-1">
        <Text className="font-medium text-gray-900">Use Current Location</Text>
        <Text className="text-sm text-gray-500">
          {isLoading ? 'Getting your location...' : 'Get your exact location'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
