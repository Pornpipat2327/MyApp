/**
 * @file use-auto-logout.ts
 * @description Hook จัดการระบบตัดเซสชันอัตโนมัติ (Auto Logout)
 * 
 * เงื่อนไขการทำงาน:
 * 1. เมื่อสลับไปใช้แอปอื่น หรือสลับแท็บเบราว์เซอร์ -> ไม่ตัดเซสชัน
 * 2. เมื่อปิดหน้าต่าง/ปิดแท็บเบราว์เซอร์ แล้วเปิดแอปใหม่ -> ตรวจสอบและสั่ง Logout พร้อมนำทางไปหน้า /login
 */

import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';

const SESSION_ALIVE_KEY = 'extreme_keys_session_alive';

export function useAutoLogout() {
  const router = useRouter();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);

  // อัปเดต ref ภายใน useEffect เพื่อปฏิบัติตามกฎของ React ไม่แก้ไข ref ระหว่าง Render
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      return;
    }

    const checkSessionOnStartup = () => {
      try {
        const user = localStorage.getItem('user');
        const isSessionAlive = sessionStorage.getItem(SESSION_ALIVE_KEY);

        if (user) {
          if (!isSessionAlive) {
            // ปิดแท็บไปแล้วเปิดใหม่ -> สั่ง Logout และล้างข้อมูล
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            sessionStorage.removeItem(SESSION_ALIVE_KEY);
            window.dispatchEvent(new Event('auth-change'));

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
        const user = localStorage.getItem('user');
        if (user) {
          sessionStorage.setItem(SESSION_ALIVE_KEY, 'true');
        } else {
          sessionStorage.removeItem(SESSION_ALIVE_KEY);
        }
      } catch {}
    };

    window.addEventListener('auth-change', handleAuthChange);

    // ล้าง session_alive ถ้าอยู่ที่หน้า Login และไม่มี User
    if (pathname === '/login') {
      try {
        if (!localStorage.getItem('user')) {
          sessionStorage.removeItem(SESSION_ALIVE_KEY);
        }
      } catch {}
    }

    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, [router, pathname]);
}
