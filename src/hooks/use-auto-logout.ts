/**
 * @file use-auto-logout.ts
 * @description Hook จัดการระบบตัดเซสชันอัตโนมัติ (Auto Logout) — Cross-platform
 *
 * เงื่อนไขการทำงาน:
 * - บน Web: เมื่อปิดแท็บแล้วเปิดใหม่ -> ตัดเซสชัน
 * - บน Mobile: ระบบ sessionStorage ไม่มี จึงข้ามขั้นตอน session-alive check
 *   (Mobile OS จัดการ lifetime ของ session ผ่าน AsyncStorage ซึ่งข้อมูลยังอยู่เมื่อ kill แอป)
 */

import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { getStorageItem, removeStorageItem, subscribeStorageChange, emitStorageChange } from '@/utils/storage';

const SESSION_ALIVE_KEY = 'extreme_keys_session_alive';

export function useAutoLogout() {
  const router = useRouter();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    // บน Mobile: ไม่ใช้ sessionStorage เพราะไม่มี
    // Mobile ใช้ AsyncStorage ซึ่งข้อมูลคงอยู่ตลอดอายุของแอป
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      return;
    }

    const checkSessionOnStartup = () => {
      try {
        const user = getStorageItem('user');
        const isSessionAlive = sessionStorage.getItem(SESSION_ALIVE_KEY);

        if (user) {
          if (!isSessionAlive) {
            // ปิดแท็บไปแล้วเปิดใหม่ -> สั่ง Logout และล้างข้อมูล
            removeStorageItem('user');
            removeStorageItem('token');
            sessionStorage.removeItem(SESSION_ALIVE_KEY);
            emitStorageChange('auth-change');

            if (pathnameRef.current !== '/login') {
              router.replace('/login' as any);
            }
          }
        }
      } catch (e) {
        console.error('Auto logout check error', e);
      }
    };

    checkSessionOnStartup();

    // ดักจับเมื่อมีการ Login หรือ Logout
    const handleAuthChange = () => {
      try {
        const user = getStorageItem('user');
        if (user) {
          sessionStorage.setItem(SESSION_ALIVE_KEY, 'true');
        } else {
          sessionStorage.removeItem(SESSION_ALIVE_KEY);
        }
      } catch {}
    };

    const unsub = subscribeStorageChange('auth-change', handleAuthChange);

    // ล้าง session_alive ถ้าอยู่ที่หน้า Login และไม่มี User
    if (pathname === '/login') {
      try {
        if (!getStorageItem('user')) {
          sessionStorage.removeItem(SESSION_ALIVE_KEY);
        }
      } catch {}
    }

    return unsub;
  }, [router, pathname]);
}
