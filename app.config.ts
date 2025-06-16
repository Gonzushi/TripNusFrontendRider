import type { ConfigContext, ExpoConfig } from '@expo/config';

import { ClientEnv, Env } from './env';

const DEBUG_MODE = false;
if (DEBUG_MODE) {
  console.log('Running app.config.ts \n');
  console.log('Env', Env);
  console.log('ClientEnv', ClientEnv);
}

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: Env.NAME,
  description: `${Env.NAME} Mobile App`,
  owner: Env.EXPO_ACCOUNT_OWNER,
  scheme: Env.SCHEME,
  slug: 'TripNusFrontendRider',
  version: Env.VERSION.toString(),
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  updates: { fallbackToCacheTimeout: 0 },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: Env.BUNDLE_ID,
    config: {
      googleMapsApiKey: Env.GOOGLE_API_KEY,
    },
    infoPlist: {
      UIBackgroundModes: ['remote-notification', 'location', 'fetch'],
      'aps-environment': 'development',
      NSLocationWhenInUseUsageDescription:
        'Aplikasi ini menggunakan lokasi Anda untuk menampilkan tempat-tempat terdekat.',
      NSLocationAlwaysUsageDescription:
        'Aplikasi ini menggunakan lokasi Anda di latar belakang untuk meningkatkan pengalaman Anda.',
      NSLocationAlwaysAndWhenInUseUsageDescription:
        'TripNus memerlukan lokasi Anda untuk menyediakan pelacakan perjalanan dan layanan navigasi yang akurat, bahkan saat aplikasi berjalan di latar belakang.',
      ITSAppUsesNonExemptEncryption: false,
      LSApplicationQueriesSchemes: ['whatsapp', 'tel', 'mailto', 'https'],
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: Env.PACKAGE,
    edgeToEdgeEnabled: false,
    googleServicesFile: Env.GOOGLE_SERVICES_FILE,
    config: {
      googleMaps: {
        apiKey: Env.GOOGLE_API_KEY,
      },
    },
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
      },
    ],
    [
      'expo-build-properties',
      {
        ios: {
          useFrameworks: 'static',
        },
      },
    ],
    [
      'expo-notifications',
      {
        androidMode: 'default',
        androidCollapsedTitle: 'TripNus',
        iosDisplayInForeground: true,
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission:
          'TripNus memerlukan akses ke galeri foto Anda untuk mengupload Foto Profil.',
      },
    ],
    'expo-task-manager',
  ],
  experiments: { typedRoutes: true },
  extra: { ...ClientEnv, eas: { projectId: Env.EAS_PROJECT_ID } },
});
