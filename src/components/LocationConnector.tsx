import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { View } from "react-native";

export default function LocationConnector() {
  return (
    <View className="w-14 items-center">
      {/* Pickup Location Icon */}
      <View className="bg-blue-100 w-10 h-10 rounded-full items-center justify-center mt-3">
        <Ionicons name="location" size={18} color="#3B82F6" />
      </View>

      {/* Connector Line with Dots */}
      <View className="my-1.5 items-center h-6 justify-between">
        <View className="w-0.5 h-2 bg-gray-300" />
        <View className="w-1 h-1 rounded-full bg-gray-300" />
        {/* <View className="w-1 h-1 rounded-full bg-gray-300" /> */}
        <View className="w-0.5 h-2 bg-gray-300" />
      </View>

      {/* Destination Location Icon */}
      <View className="bg-red-100 w-10 h-10 rounded-full items-center justify-center mb-2">
        <MaterialIcons name="location-on" size={18} color="#EF4444" />
      </View>
    </View>
  );
}
