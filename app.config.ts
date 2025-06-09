import type { ConfigContext, ExpoConfig } from '@expo/config';

import { ClientEnv, Env } from './env';

console.log('Running app.config.ts \n');
console.log('Env', Env);
console.log('ClientEnv', ClientEnv);

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
      UIBackgroundModes: ['remote-notification'],
      'aps-environment': 'development',
      NSLocationWhenInUseUsageDescription:
        'This app uses your location to show nearby places.',
      NSLocationAlwaysUsageDescription:
        'This app uses your location in the background to improve your experience.',
      ITSAppUsesNonExemptEncryption: false,
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
