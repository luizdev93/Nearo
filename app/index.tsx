import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthStore } from '../src/state/auth_store';
import { LoadingScreen } from '../src/components/common/LoadingScreen';

export default function SplashRedirect() {
  const router = useRouter();
  const isHydrated = useAuthStore((s) => s.isHydrated);

  useEffect(() => {
    if (!isHydrated) return;

    SplashScreen.hideAsync();
    router.replace('/(tabs)');
  }, [isHydrated]);

  return <LoadingScreen />;
}
