import { Ionicons } from '@expo/vector-icons';
import { type Router } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

type MapPickerHeaderProps = {
  router: Router;
  type: string;
};

export function MapPickerHeader({ router, type }: MapPickerHeaderProps) {
  return (
    <View className="flex-row items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
      <TouchableOpacity
        onPress={() => router.back()}
        className="-ml-2 p-2"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="arrow-back" size={24} color="#111827" />
      </TouchableOpacity>
      <Text className="text-lg font-semibold text-gray-900">
        {type === 'pickup' ? 'Pilih Lokasi Penjemputan' : 'Pilih Lokasi Tujuan'}
      </Text>
      <View className="w-10" />
    </View>
  );
}
