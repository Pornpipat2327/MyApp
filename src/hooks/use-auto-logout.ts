import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';

const SESSION_ALIVE_KEY = 'extreme_keys_session_alive';

/**
 * useAutoLogout Hook
 * 
 * เงื่อนไขการทำงาน:
 * 1. เมื่อสลับไปใช้แอปอื่น (Switch apps) หรือสลับแท็บเบราว์เซอร์ -> ไม่ต้องทำงาน (ไม่หลุด Session)
 * 2. เมื่อปิดหน้าต่าง/ปิดแท็บเบราว์เซอร์ แล้วเปิดกลับเข้ามาใหม่ -> สั่ง Logout ทันที และเด้งไปหน้า /login เสมอ
 */
export function useAutoLogout() {
  const router = useRouter();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      // บน Mobile: เมื่อสลับไปแอปอื่น ไม่ต้องทำงานตามที่ผู้ใช้สั่ง (ไม่ตัด Session)
      return;
    }

    const checkSessionOnStartup = () => {
      try {
        const user = localStorage.getItem('user');
        const isSessionAlive = sessionStorage.getItem(SESSION_ALIVE_KEY);

        if (user) {
          if (!isSessionAlive) {
            // ไม่พบ Session ในแท็บนี้ (หมายถึงผู้ใช้ปิดแท็บ/ปิดเบราว์เซอร์ไปแล้วเปิดกลับเข้ามาใหม่)
            // สั่ง Logout ทันที และเคลียร์ข้อมูล
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            sessionStorage.removeItem(SESSION_ALIVE_KEY);
            window.dispatchEvent(new Event('auth-change'));

            if (pathnameRef.current !== '/login') {
              router.replace('/login' as any);
            }
          } else {
            // เซสชันเดิมยังเปิดอยู่ (เช่น รีเฟรชหน้า หรือสลับแท็บ/สลับแอปแล้วกลับมา) -> ใช้งานต่อได้
          }
        }
      } catch (e) {
        console.error('Auto logout check error', e);
      }
    };

    // ตรวจสอบสถานะเซสชันทันทีที่คอมโพเนนต์โหลด
    checkSessionOnStartup();

    // ดักจับเมื่อมีการ Login หรือ Logout เพื่ออัปเดตสถานะ session_alive ให้ตรงกัน
    const handleAuthChange = () => {
      try {
        const user = localStorage.getItem('user');
        if (user) {
          sessionStorage.setItem(SESSION_ALIVE_KEY, 'true');
        } else {
          sessionStorage.removeItem(SESSION_ALIVE_KEY);
        }
      } catch (e) {}
    };

    window.addEventListener('auth-change', handleAuthChange);

    // หากผู้ใช้อยู่หน้า Login และมี session_alive ค้างอยู่ ให้ล้างออก
    if (pathnameRef.current === '/login') {
      try {
        if (!localStorage.getItem('user')) {
          sessionStorage.removeItem(SESSION_ALIVE_KEY);
        }
      } catch (e) {}
    }

    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, [router]);
}
