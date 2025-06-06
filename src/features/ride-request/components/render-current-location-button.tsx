import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

type RenderCurrentLocationButtonProps = {
  handleUseCurrentLocation: () => void;
  isLoadingLocation: boolean;
};

export default function RenderCurrentLocationButton({
  handleUseCurrentLocation,
  isLoadingLocation,
}: RenderCurrentLocationButtonProps) {
  return (
    <TouchableOpacity
      onPress={handleUseCurrentLocation}
      disabled={isLoadingLocation}
      className="flex-row items-center bg-white px-4 py-3 active:bg-gray-50"
    >
      <View className="rounded-full bg-blue-50 p-2">
        <MaterialCommunityIcons
          name="crosshairs-gps"
          size={24}
          color="#3B82F6"
        />
      </View>
      <View className="ml-3 flex-1">
        <Text className="font-medium text-gray-900">
          Gunakan lokasi saat ini
        </Text>
        <Text className="text-sm text-gray-500">
          {isLoadingLocation
            ? 'Mendapatkan lokasi Anda...'
            : 'Pilih cepat posisi Anda saat ini'}
        </Text>
      </View>
      {isLoadingLocation && <ActivityIndicator size="small" color="#3B82F6" />}
    </TouchableOpacity>
  );
}
