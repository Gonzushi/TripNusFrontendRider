import { ScrollView, Text, View } from 'react-native';

import { SafeView } from '@/lib/safe-view';

export default function Chat() {
  return (
    <SafeView isShowingTabBar={true}>
      <ScrollView className="flex-1 bg-gray-50">
        <View className="p-4">
          <View className="mb-4 rounded-lg bg-white p-4 shadow-sm">
            <Text className="mb-2 text-lg font-semibold text-gray-800">
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
