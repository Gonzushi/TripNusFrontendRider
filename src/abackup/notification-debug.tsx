import { Text, View } from 'react-native';

import { useNotifications } from '@/abackup/use-notifications';

export default function NotificationDebug() {
  const { expoPushToken, notification, error } = useNotifications();

  return (
    <View className="m-4 rounded-lg bg-black/90 p-4">
      <Text className="mb-4 font-mono text-base font-bold text-white">
        Notification Debug Info
      </Text>

      <View className="mb-3 border-b border-white/20 pb-3">
        <Text className="mb-2 font-mono text-sm font-semibold text-white">
          Expo Push Token
        </Text>
        <Text className="break-all font-mono text-xs text-white/80">
          {expoPushToken || 'No token yet'}
        </Text>
        {error && (
          <Text className="mt-2 font-mono text-xs text-red-400">
            Error: {error}
          </Text>
        )}
      </View>

      <View>
        <Text className="mb-2 font-mono text-sm font-semibold text-white">
          Last Notification
        </Text>
        {notification ? (
          <Text className="font-mono text-xs text-white/80">
            {JSON.stringify(notification, null, 2)}
          </Text>
        ) : (
          <Text className="font-mono text-xs text-white/80">
            No notifications received
          </Text>
        )}
      </View>
    </View>
  );
}
