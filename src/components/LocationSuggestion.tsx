import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

interface LocationSuggestionProps {
  title: string;
  address: string;
  type: "api" | "recent" | "popular";
  onPress: () => void;
}

export default function LocationSuggestion({
  title,
  address,
  type,
  onPress,
}: LocationSuggestionProps) {
  const getIconProps = () => {
    switch (type) {
      case "api":
        return {
          name: "location",
          bgColor: "bg-green-100",
          iconColor: "#10B981",
        };
      case "recent":
        return {
          name: "time",
          bgColor: "bg-blue-100",
          iconColor: "#3B82F6",
        };
      default:
        return {
          name: "star",
          bgColor: "bg-purple-100",
          iconColor: "#8B5CF6",
        };
    }
  };

  const { name, bgColor, iconColor } = getIconProps();

  return (
    <TouchableOpacity
      className="flex-row items-center px-4 py-4 border-b border-gray-100 active:bg-gray-50"
      onPress={onPress}
    >
      <View
        className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${bgColor}`}
      >
        <Ionicons name={name as any} size={20} color={iconColor} />
      </View>
      <View>
        <Text className="text-gray-800 font-medium">{title}</Text>
        <Text className="text-gray-500 text-sm">{address}</Text>
      </View>
    </TouchableOpacity>
  );
}
