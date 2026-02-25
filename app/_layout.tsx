import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/providers/AuthProvider';
import { LocalizationProvider } from '../src/providers/LocalizationProvider';
import '../src/localization/i18n';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <LocalizationProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="listing/[id]" options={{ headerShown: true, title: '' }} />
          <Stack.Screen name="chat/[id]" options={{ headerShown: true, title: '' }} />
          <Stack.Screen name="user/[id]" options={{ headerShown: true, title: '' }} />
          <Stack.Screen name="favorites" options={{ headerShown: true, title: '' }} />
          <Stack.Screen name="edit-profile" options={{ headerShown: true, title: '' }} />
          <Stack.Screen name="notifications" options={{ headerShown: true, title: '' }} />
          <Stack.Screen name="promote/[id]" options={{ headerShown: true, title: '' }} />
          <Stack.Screen name="report/[id]" options={{ headerShown: true, title: '' }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </AuthProvider>
    </LocalizationProvider>
  );
}
