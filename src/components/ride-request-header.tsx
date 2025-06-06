import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

export default function RideRequestHeader() {
  return (
    <View className="bg-white px-4 pb-6 pt-4">
      <View className="mb-3 flex-row items-center justify-between">
        <View>
          <Text className="text-2xl font-bold text-gray-900">Where to?</Text>
          <Text className="mt-1 text-base text-gray-500">
            Book a ride to your destination
          </Text>
        </View>
        <View className="rounded-full bg-blue-50 p-3">
          <Ionicons name="car" size={24} color="#3B82F6" />
        </View>
      </View>

      <View className="flex-row items-center">
        <View className="mr-2 flex-row items-center rounded-full bg-blue-50 px-3 py-1.5">
          <Ionicons name="flash" size={16} color="#3B82F6" />
          <Text className="ml-1 text-sm font-medium text-blue-600">
            Fast pickup
          </Text>
        </View>
        <View className="flex-row items-center rounded-full bg-green-50 px-3 py-1.5">
          <Ionicons name="leaf" size={16} color="#10B981" />
          <Text className="ml-1 text-sm font-medium text-green-600">
            Eco-friendly
          </Text>
        </View>
      </View>
    </View>
  );
}
