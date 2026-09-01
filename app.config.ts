import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Kleenest Business',
  slug: 'kleenest-business',
  version: '0.1.0',
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
    output: 'single',
    bundler: 'metro',
    name: 'Kleenest Business',
    shortName: 'Kleenest Business',
  },
  plugins: ['expo-router', 'expo-secure-store'],
  experiments: { typedRoutes: true },
  extra: {
    appRole: 'business',
    supabaseProjectRef: 'ssgesjzdvdsqacdtasje',
  },
};

export default config;
