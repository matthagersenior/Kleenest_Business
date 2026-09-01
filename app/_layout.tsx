import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerLargeTitle: true,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: '#f5f7f6' },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Business Control Center' }} />
      </Stack>
    </>
  );
}
