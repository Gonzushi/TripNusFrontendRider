import { SafeView } from '@/lib/safe-view';
import { ScrollView, Text, View } from 'react-native';

export default function Chat() {
  return (
    <SafeView isShowingTabBar={true}>
      <ScrollView className="flex-1 bg-gray-50">
        <View className="p-4">
          <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <Text className="text-lg font-semibold text-gray-800 mb-2">
              No Messages
            </Text>
            <Text className="text-gray-600">
              Your conversations with drivers will appear here
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeView>
  );
}
