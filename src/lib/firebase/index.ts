import { getApp, getApps, initializeApp } from '@react-native-firebase/app';
import { Platform } from 'react-native';

import firebaseConfig from './firebase-config';

export async function initializeFirebase() {
  if (Platform.OS === 'android') {
    try {
      if (getApps().length === 0) {
        console.log('Initializing Firebase...');
        await initializeApp(firebaseConfig);
        console.log('Firebase initialized successfully');
      } else {
        console.log('Firebase already initialized, getting existing app');
        getApp();
      }
    } catch (error) {
      console.error('Firebase initialization error:', error);
      throw error;
    }
  } else {
    console.log('Firebase initialization skipped for non-Android platform');
  }
}
