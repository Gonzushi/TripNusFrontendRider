/* eslint-disable max-lines-per-function */
import type { ConfigContext, ExpoConfig } from '@expo/config';
import type { AppIconBadgeConfig } from 'app-icon-badge/types';

import { ClientEnv, Env } from './env';

const appIconBadgeConfig: AppIconBadgeConfig = {
  enabled: Env.APP_ENV !== 'production',
  badges: [
    { text: Env.APP_ENV, type: 'banner', color: 'white' },
    { text: Env.VERSION.toString(), type: 'ribbon', color: 'white' },
  ],
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: Env.NAME,
  description: `${Env.NAME} Mobile App`,
  owner: Env.EXPO_ACCOUNT_OWNER,
  scheme: Env.SCHEME,
  slug: 'tripnus-rider',
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
      UIBackgroundModes: ['remote-notification'],
      'aps-environment': 'development',
      NSLocationWhenInUseUsageDescription:
        'This app uses your location to show nearby places.',
      NSLocationAlwaysUsageDescription:
        'This app uses your location in the background to improve your experience.',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: Env.PACKAGE,
    edgeToEdgeEnabled: true,
    googleServicesFile: './google-services.json',
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
        // "icon": "./assets/images/notification-icon.png",
        // "color": "#ffffff",
        // "sounds": ["./assets/sounds/notification.wav"],
        androidMode: 'default',
        androidCollapsedTitle: 'TripNus',
        iosDisplayInForeground: true,
      },
    ],
  ],
  experiments: { typedRoutes: true },
  extra: { ...ClientEnv, eas: { projectId: Env.EAS_PROJECT_ID } },
});
