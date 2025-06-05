import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import {
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
  registerForPushNotificationsAsync,
} from './notifications';

export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [notification, setNotification] =
    useState<Notifications.Notification>();
  const [error, setError] = useState<string>();

  const notificationListener = useRef<ReturnType<
    typeof Notifications.addNotificationReceivedListener
  > | null>(null);
  const responseListener = useRef<ReturnType<
    typeof Notifications.addNotificationResponseReceivedListener
  > | null>(null);

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((token) => {
        if (token) {
          setExpoPushToken(token);
          setError(undefined);
          console.log('Push token set:', token);
        } else {
          setError('Failed to get push token');
          console.log('No push token received');
        }
      })
      .catch((err) => {
        setError(err.message);
        console.error('Error getting push token:', err);
      });

    notificationListener.current = addNotificationReceivedListener(
      (notification) => {
        setNotification(notification);
        console.log('Received notification:', notification);
      }
    );

    responseListener.current = addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification response:', response);
        // Handle notification taps here
      }
    );

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return {
    expoPushToken,
    notification,
    error,
  };
}
