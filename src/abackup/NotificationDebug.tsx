import { useNotifications } from '@/abackup/useNotifications';
import { Text, View } from 'react-native';

export default function NotificationDebug() {
  const { expoPushToken, notification, error } = useNotifications();

  return (
    <View className="m-4 p-4 bg-black/90 rounded-lg">
      <Text className="text-white font-mono text-base font-bold mb-4">
        Notification Debug Info
      </Text>

      <View className="border-b border-white/20 pb-3 mb-3">
        <Text className="text-white font-mono text-sm font-semibold mb-2">
          Expo Push Token
        </Text>
        <Text className="text-white/80 font-mono text-xs break-all">
          {expoPushToken || 'No token yet'}
        </Text>
        {error && (
          <Text className="text-red-400 font-mono text-xs mt-2">
            Error: {error}
          </Text>
        )}
      </View>

      <View>
        <Text className="text-white font-mono text-sm font-semibold mb-2">
          Last Notification
        </Text>
        {notification ? (
          <Text className="text-white/80 font-mono text-xs">
            {JSON.stringify(notification, null, 2)}
          </Text>
        ) : (
          <Text className="text-white/80 font-mono text-xs">
            No notifications received
          </Text>
        )}
      </View>
    </View>
  );
}
