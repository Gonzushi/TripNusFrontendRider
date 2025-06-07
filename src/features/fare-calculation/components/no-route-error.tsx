import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

export default function NoRouteError({ onBack }: { onBack: () => void }) {
  return (
    <View className="flex-1 items-center justify-center bg-gray-100 px-4">
      <MaterialCommunityIcons name="map-marker-off" size={48} color="#EF4444" />
      <Text className="mt-4 text-center text-lg font-medium text-gray-900">
        Rute Tidak Tersedia
      </Text>
      <Text className="mb-6 mt-2 text-center text-gray-600">
        Kami tidak dapat menemukan rute yang valid antara lokasi ini. Tujuan
        mungkin tidak dapat dijangkau atau terlalu jauh.
      </Text>
      <TouchableOpacity
        onPress={onBack}
        className="rounded-xl bg-blue-600 px-6 py-3 active:bg-blue-600"
      >
        <Text className="font-semibold text-white">Pilih Lokasi Lain</Text>
      </TouchableOpacity>
    </View>
  );
}
