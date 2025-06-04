import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

interface CurrentLocationButtonProps {
  onPress: () => void;
  isLoading?: boolean;
}

export default function CurrentLocationButton({
  onPress,
  isLoading = false,
}: CurrentLocationButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center px-4 py-3 bg-white border-t border-b border-gray-100 active:bg-gray-50"
    >
      <View className="bg-blue-50 w-10 h-10 rounded-full items-center justify-center mr-3">
        <Ionicons name="locate" size={20} color="#3B82F6" />
      </View>
      <View className="flex-1">
        <Text className="text-gray-900 font-medium">Use Current Location</Text>
        <Text className="text-gray-500 text-sm">
          {isLoading ? "Getting your location..." : "Get your exact location"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
