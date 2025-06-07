// File: app/providers/NotificationProvider.tsx

import type * as Notifications from 'expo-notifications';
import React, { createContext, useContext, useEffect, useState } from 'react';

import {
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
  registerForPushNotificationsAsync,
} from './notifications';

type NotificationContextValue = {
  expoPushToken: string | null;
  lastNotificationResponse: Notifications.NotificationResponse | null;
  lastNotification: Notifications.Notification | null;
  error: string | null; 
};

const NotificationContext = createContext<NotificationContextValue>({
  expoPushToken: null,
  lastNotificationResponse: null,
  lastNotification: null,
  error: null,
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [lastNotificationResponse, setLastNotificationResponse] =
    useState<Notifications.NotificationResponse | null>(null);
  const [lastNotification, setLastNotification] =
    useState<Notifications.Notification | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((token) => {
        if (token) {
          setExpoPushToken(token);
        } else {
          setError('Failed to get push notification token.');
        }
      })
      .catch((err) => {
        console.error('Error registering for push notifications:', err);
        setError(err instanceof Error ? err.message : String(err));
      });

    const receivedSubscription = addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received in foreground:', notification);
        setLastNotification(notification);
      }
    );

    const responseSubscription = addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification tapped:', response);
        setLastNotificationResponse(response);
      }
    );

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        expoPushToken,
        lastNotificationResponse,
        lastNotification,
        error,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotification must be used within a NotificationProvider'
    );
  }
  return context;
};
