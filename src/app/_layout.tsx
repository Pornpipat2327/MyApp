/**
 * @file _layout.tsx
 * @description Layout หลักของระบบ (Root Layout) กำหนด Theme, Splash Screen, Cart Provider และ Auto Logout
 */

import { DarkTheme, DefaultTheme, ThemeProvider, usePathname, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { CartProvider } from '@/context/cart-context';
import { useAutoLogout } from '@/hooks/use-auto-logout';
import { initStorage, getStorageItem, subscribeStorageChange } from '@/utils/storage';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const pathname = usePathname();
  const [storageReady, setStorageReady] = useState(false);

  // ── โหลด Storage เข้า memory ก่อนแสดง UI ─────────────────────────────────
  useEffect(() => {
    initStorage().finally(() => setStorageReady(true));
  }, []);

  // ใช้งาน Auto Logout
  useAutoLogout();

  // ── ตรวจสอบ Auth และ Redirect ────────────────────────────────────────────
  useEffect(() => {
    if (!storageReady) return;

    const checkAndRedirect = () => {
      const user = getStorageItem('user');
      if (!user && pathname !== '/login') {
        router.replace('/login' as any);
      }
    };

    checkAndRedirect();

    // ดักฟัง auth-change บน Mobile และ Web ผ่าน Universal Event Emitter
    const unsub = subscribeStorageChange('auth-change', checkAndRedirect);
    return unsub;
  }, [storageReady, pathname, router]);

  if (!storageReady) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <CartProvider>
        <AnimatedSplashOverlay />
        <AppTabs />
      </CartProvider>
    </ThemeProvider>
  );
}
