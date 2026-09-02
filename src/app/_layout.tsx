/**
 * @file _layout.tsx
 * @description Layout หลักของระบบ (Root Layout) กำหนด Theme, Splash Screen, Cart Provider และ Auto Logout
 */

import { DarkTheme, DefaultTheme, ThemeProvider, usePathname, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Platform, useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { CartProvider } from '@/context/cart-context';
import { useAutoLogout } from '@/hooks/use-auto-logout';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const pathname = usePathname();

  // ใช้งาน Standalone Auto Logout เมื่อปิดแท็บแล้วเปิดใหม่
  useAutoLogout();

  // ตรวจสอบสถานะการเข้าสู่ระบบและนำทางไปหน้า Login หากยังไม่ได้ล็อกอิน
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
  }, [pathname, router]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <CartProvider>
        <AnimatedSplashOverlay />
        <AppTabs />
      </CartProvider>
    </ThemeProvider>
  );
}
