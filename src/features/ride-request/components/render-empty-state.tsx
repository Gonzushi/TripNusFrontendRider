import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

export default function RenderEmptyState() {
  return (
    <View className="flex-1 items-center justify-center px-6">
      <MaterialCommunityIcons
        name="map-marker-path"
        size={120}
        color="#3B82F6"
      />
      <Text className="mt-6 text-center text-xl font-semibold text-gray-900">
        Mau pergi kemana?
      </Text>
      <Text className="mt-2 text-center leading-5 text-gray-500">
        Masukkan lokasi penjemputan dan tujuan Anda di atas untuk memulai
        perjalanan
      </Text>
    </View>
  );
}
