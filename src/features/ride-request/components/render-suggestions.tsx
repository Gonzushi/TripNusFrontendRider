import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

import { type LocationDetail } from '../types';
import LoadingDots from './loading-dots';

type RenderSuggestionsProps = {
  isTyping: boolean;
  isLoading: boolean;
  suggestions: LocationDetail[];
  handleSuggestionSelect: (location: LocationDetail) => void;
};

export default function RenderSuggestions({
  isTyping,
  isLoading,
  suggestions,
  handleSuggestionSelect,
}: RenderSuggestionsProps) {
  return (
    <View className="mt-2 bg-white">
      <View className="border-b border-gray-100 px-4 py-3">
        <Text className="text-sm font-medium text-gray-900">
          {isTyping || isLoading ? 'Searching...' : 'Suggestions'}
        </Text>
      </View>

      {isTyping || isLoading ? (
        <View className="flex items-center justify-center py-8">
          <LoadingDots size={8} spacing={4} color="#3B82F6" />
        </View>
      ) : suggestions.length > 0 ? (
        suggestions.map((location, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleSuggestionSelect(location)}
            className="px-4 py-3 active:bg-gray-50"
          >
            <View className="flex-row items-center">
              <View className="rounded-full bg-gray-100 p-2">
                <MaterialCommunityIcons
                  name="map-marker"
                  size={20}
                  color="#4B5563"
                />
              </View>
              <View className="ml-3 flex-1">
                <Text className="font-medium text-gray-900" numberOfLines={1}>
                  {location.title}
                </Text>
                <Text className="text-sm text-gray-500" numberOfLines={2}>
                  {location.address}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <View className="items-center px-4 py-12">
          <MaterialCommunityIcons name="map-search" size={48} color="#9CA3AF" />
          <Text className="mt-4 text-center text-gray-400">
            Type to search for locations
          </Text>
        </View>
      )}
    </View>
  );
}
