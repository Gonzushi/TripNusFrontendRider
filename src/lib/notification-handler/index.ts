import AsyncStorage from '@react-native-async-storage/async-storage';
import { type Router } from 'expo-router';
import { Alert } from 'react-native';

import { AUTH_STORAGE_KEY } from '../auth/constants';
import { getActiveRide } from '../ride/api';
import { useRideStore } from '../ride/store';
import { type NotificationData } from './types';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const NotificationHandler = async (data: NotificationData, router: Router) => {
  const value = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
  const storedState = JSON.parse(value!);
  const authData = storedState.data;

  console.log('[notification]', data.type);

  // Helper function to fetch and handle ride data
  const fetchAndHandleRideData = async () => {
    try {
      const response = await getActiveRide(authData!.session.access_token);

      if (response?.data) {
        // Update the ride store with new data
        useRideStore.getState().setRideData(response.data);
        useRideStore.getState().setRideStatus(response.data.status);
      } else {
        useRideStore.getState().setRideData(null);
        useRideStore.getState().setRideStatus(null);
      }
    } catch (error) {
      console.error('Error handling active ride:', error);
    }
  };

  switch (data.type) {
    case 'RIDE_CONFIRMED':
      await fetchAndHandleRideData();
      break;

    case 'RIDE_ARRIVED':
      await fetchAndHandleRideData();
      break;

    case 'RIDE_CANCELLED_BY_DRIVER':
      Alert.alert(
        'Perjalanan dibatalkan',
        'Driver telah membatalkan perjalanan Anda. Kami akan mencari driver lainnya.'
      );
      useRideStore.getState().setRideStatus('searching');
      break;

    case 'RIDE_CANCELLED':
      await wait(5000);
      Alert.alert(
        'Perjalanan dibatalkan',
        'Tidak ada driver tersedia untuk perjalanan Anda. Kami mohon maaf atas ketidaknyamanan ini.',
        [
          {
            text: 'OK',
            onPress: () => {
              useRideStore.getState().setRideData(null);
              useRideStore.getState().setRideStatus(null);
              router.replace('/');
            },
          },
        ]
      );
      break;
  }
};

export default NotificationHandler;
