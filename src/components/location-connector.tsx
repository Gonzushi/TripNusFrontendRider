import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { View } from 'react-native';

export default function LocationConnector() {
  return (
    <View className="w-14 items-center">
      {/* Pickup Location Icon */}
      <View className="mt-3 h-10 w-10 items-center justify-center rounded-full bg-blue-100">
        <Ionicons name="location" size={18} color="#3B82F6" />
      </View>

      {/* Connector Line with Dots */}
      <View className="my-1.5 h-6 items-center justify-between">
        <View className="h-2 w-0.5 bg-gray-300" />
        <View className="h-1 w-1 rounded-full bg-gray-300" />
        {/* <View className="w-1 h-1 rounded-full bg-gray-300" /> */}
        <View className="h-2 w-0.5 bg-gray-300" />
      </View>

      {/* Destination Location Icon */}
      <View className="mb-2 h-10 w-10 items-center justify-center rounded-full bg-red-100">
        <MaterialIcons name="location-on" size={18} color="#EF4444" />
      </View>
    </View>
  );
}
