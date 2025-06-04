import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

export default function RideRequestHeader() {
  return (
    <View className="bg-white px-4 pt-4 pb-6">
      <View className="flex-row items-center justify-between mb-3">
        <View>
          <Text className="text-2xl font-bold text-gray-900">Where to?</Text>
          <Text className="text-base text-gray-500 mt-1">
            Book a ride to your destination
          </Text>
        </View>
        <View className="bg-blue-50 p-3 rounded-full">
          <Ionicons name="car" size={24} color="#3B82F6" />
        </View>
      </View>

      <View className="flex-row items-center">
        <View className="flex-row items-center bg-blue-50 px-3 py-1.5 rounded-full mr-2">
          <Ionicons name="flash" size={16} color="#3B82F6" />
          <Text className="text-blue-600 text-sm font-medium ml-1">
            Fast pickup
          </Text>
        </View>
        <View className="flex-row items-center bg-green-50 px-3 py-1.5 rounded-full">
          <Ionicons name="leaf" size={16} color="#10B981" />
          <Text className="text-green-600 text-sm font-medium ml-1">
            Eco-friendly
          </Text>
        </View>
      </View>
    </View>
  );
}
