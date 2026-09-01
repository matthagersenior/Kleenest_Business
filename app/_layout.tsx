import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { BusinessWorkspaceProvider } from '@/state/businessWorkspace';

export default function RootLayout() {
  return (
    <BusinessWorkspaceProvider>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerLargeTitle: true,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: '#f5f7f6' },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Business Control Center' }} />
        <Stack.Screen name="profile" options={{ title: 'Business Profile' }} />
        <Stack.Screen name="locations" options={{ title: 'Locations' }} />
        <Stack.Screen name="reviews" options={{ title: 'Reviews' }} />
        <Stack.Screen name="engagement" options={{ title: 'Engagement' }} />
        <Stack.Screen name="intelligence" options={{ title: 'Growth Intelligence' }} />
        <Stack.Screen name="governance" options={{ title: 'Governance & Trust' }} />
      </Stack>
    </BusinessWorkspaceProvider>
  );
}
