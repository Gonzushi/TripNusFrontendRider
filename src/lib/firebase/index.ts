import { getApp, getApps, initializeApp } from '@react-native-firebase/app';
import { Platform } from 'react-native';
import googleServices from '../../../google-services.json';

export async function initializeFirebase() {
  if (Platform.OS === 'android') {
    try {
      if (getApps().length === 0) {
        console.log('Initializing Firebase...');

        const config = {
          appId: googleServices.client[0].client_info.mobilesdk_app_id,
          apiKey: googleServices.client[0].api_key[0].current_key,
          projectId: googleServices.project_info.project_id,
          storageBucket: googleServices.project_info.storage_bucket,
          messagingSenderId: googleServices.project_info.project_number,
        };

        await initializeApp(config);
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
