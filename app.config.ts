import type { ExpoConfig } from 'expo/config';

const EAS_PROJECT_ID = '15ac343b-81bf-459b-8c25-1b2fc8b293de';

const config: ExpoConfig = {
  name: 'Kleenest Business',
  slug: 'kleenest-business',
  version: '0.1.0',
  runtimeVersion: 'kleenest-business-0.1.0',
  icon: './assets/app-icon.png',
  updates: {
    enabled: true,
    url: `https://u.expo.dev/${EAS_PROJECT_ID}`,
    checkAutomatically: 'ON_LOAD',
    fallbackToCacheTimeout: 0,
    requestHeaders: { 'expo-channel-name': 'business-production' },
  },
  orientation: 'portrait',
  scheme: 'kleenest-business',
  userInterfaceStyle: 'automatic',
  ios: {
    bundleIdentifier: 'com.kleenest.business',
    supportsTablet: true,
    config: { usesNonExemptEncryption: false },
    infoPlist: {
      NSLocationWhenInUseUsageDescription: 'Kleenest Business uses location to operate nearby Live Network and location workflows you enable.',
      NSLocationAlwaysAndWhenInUseUsageDescription: 'Kleenest Business uses background location only when you enable Live Network geofence alerts for your business locations.',
      UIBackgroundModes: ['location'],
    },
  },
  android: {
    package: 'com.kleenest.business',
    icon: './assets/app-icon.png',
    permissions: ['ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION', 'ACCESS_BACKGROUND_LOCATION'],
    blockedPermissions: ['android.permission.RECORD_AUDIO', 'android.permission.SYSTEM_ALERT_WINDOW'],
  },
  web: {
    output: 'static',
    bundler: 'metro',
    name: 'Kleenest Business',
    shortName: 'Kleenest Business',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    ['expo-location', {
      locationWhenInUsePermission: 'Kleenest Business uses location to operate nearby Live Network and location workflows you enable.',
      locationAlwaysAndWhenInUsePermission: 'Kleenest Business uses background location only when you enable Live Network geofence alerts for your business locations.',
      isAndroidBackgroundLocationEnabled: true,
      isAndroidForegroundServiceEnabled: true,
      isIosBackgroundLocationEnabled: true,
    }],
    ['expo-notifications', { defaultChannel: 'live-network' }],
    ['expo-image-picker', {
      photosPermission: 'Kleenest Business uses your photo library only when you choose business branding or other media to upload.',
      microphonePermission: false,
    }],
  ],
  experiments: {
    typedRoutes: true,
    baseUrl: '/Kleenest_Business',
  },
  extra: {
    appRole: 'business',
    otaChannel: 'business-production',
    supabaseProjectRef: 'ssgesjzdvdsqacdtasje',
    eas: { projectId: EAS_PROJECT_ID },
  },
};

export default config;
