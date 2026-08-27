import { DarkTheme, DefaultTheme, ThemeProvider, usePathname, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Platform, useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { CartProvider } from '@/context/cart-context';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuthAndRedirect = () => {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const user = localStorage.getItem('user');
        if (!user && pathname !== '/login') {
          router.replace('/login' as any);
        }
      }
    };
    checkAuthAndRedirect();
  }, [pathname]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <CartProvider>
        <AnimatedSplashOverlay />
        <AppTabs />
      </CartProvider>
    </ThemeProvider>
  );
}
