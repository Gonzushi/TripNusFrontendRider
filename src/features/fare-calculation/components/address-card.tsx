import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { type Location } from '../types';

type AddressCardProps = {
  pickup: Location;
  dropoff: Location;
  onBack: () => void;
};
export default function AddressCard({
  pickup,
  dropoff,
  onBack,
}: AddressCardProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="absolute left-4 right-4 z-10"
      style={{ top: insets.top + 10 }}
    >
      <View className="flex-row items-center space-x-3">
        <TouchableOpacity
          onPress={onBack}
          className="my-6 mr-3 self-start rounded-xl bg-white p-2.5 shadow"
        >
          <Ionicons name="arrow-back" size={18} color="#111827" />
        </TouchableOpacity>

        <View className="flex-1 rounded-xl bg-white px-3 py-2.5 shadow-lg">
          <View className="flex-row items-center space-x-3">
            <View className="ml-2 mr-4 justify-between" style={{ width: 12 }}>
              <View className="mx-auto h-3 w-3 rounded-full bg-blue-600" />
              <View className="mx-auto h-6 w-[1px] bg-gray-300" />
              <View className="mx-auto h-3 w-3 rounded-full bg-red-600" />
            </View>
            <View className="flex-1 space-y-2 py-2">
              <View className="border-b border-gray-100 pb-2">
                <Text
                  className="text-sm font-medium text-gray-900"
                  numberOfLines={1}
                >
                  {pickup.address}
                </Text>
              </View>
              <View>
                <Text
                  className="pt-2 text-sm font-medium text-gray-900"
                  numberOfLines={1}
                >
                  {dropoff.address}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
