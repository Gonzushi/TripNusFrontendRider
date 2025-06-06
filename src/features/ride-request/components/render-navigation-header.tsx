import { Ionicons } from '@expo/vector-icons';
import { type Router } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

type RenderNavigationHeaderProps = {
  router: Router;
};

export default function RenderNavigationHeader({
  router,
}: RenderNavigationHeaderProps) {
  return (
    <View className="flex-row items-center justify-between bg-white px-4 py-3">
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      <Text className="text-lg font-semibold text-black">Request a Ride</Text>
      <View style={{ width: 24 }} />
    </View>
  );
}
