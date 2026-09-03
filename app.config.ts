import type { ExpoConfig } from 'expo/config';

const EAS_PROJECT_ID = '22a65aa3-c615-4c4f-a34d-084babc28fd7';

const config: ExpoConfig = {
  name: 'Kleenest Business',
  slug: 'kleenest-business',
  version: '0.1.0',
  runtimeVersion: 'kleenest-business-0.1.0',
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
  },
  android: {
    package: 'com.kleenest.business',
  },
  web: {
    output: 'static',
    bundler: 'metro',
    name: 'Kleenest Business',
    shortName: 'Kleenest Business',
  },
  plugins: ['expo-router', 'expo-secure-store'],
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
