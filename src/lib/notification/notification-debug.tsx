import { Text, View } from 'react-native';

import { useNotification } from './notification-provider';

export default function NotificationDebug() {
  const { expoPushToken, lastNotification, lastNotificationResponse, error } =
    useNotification();

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
        {lastNotification ? (
          <Text className="font-mono text-xs text-white/80">
            {JSON.stringify(lastNotification, null, 2)}
          </Text>
        ) : (
          <Text className="font-mono text-xs text-white/80">
            No notifications received
          </Text>
        )}
      </View>

      <View>
        <Text className="my-2 font-mono text-sm font-semibold text-white">
          Last Notification Response
        </Text>
        {lastNotificationResponse ? (
          <Text className="font-mono text-xs text-white/80">
            {JSON.stringify(lastNotificationResponse, null, 2)}
          </Text>
        ) : (
          <Text className="font-mono text-xs text-white/80">
            No notifications response received
          </Text>
        )}
      </View>
    </View>
  );
}
