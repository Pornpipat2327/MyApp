import { useEffect, useRef } from 'react';
import { Platform, AppState, AppStateStatus } from 'react-native';
import { useRouter, usePathname } from 'expo-router';

/**
 * useAutoLogout Hook
 * 
 * โมดูล Standalone Plug-and-play สำหรับระบบ Auto-Logout:
 * 1. Web: ดักจับการปิดแท็บ, ยุบเบราว์เซอร์, หรือสลับแท็บ (visibilitychange / pagehide / beforeunload)
 * 2. Mobile: ดักจับการพับแอป, สลับแอป, หรือปิดแอป (AppState background/inactive)
 * 3. เคลียร์ Session (user/token) ทันที และเด้งกลับไปหน้า /login เสมอเมื่อเปิดกลับเข้ามา
 */
export function useAutoLogout() {
  const router = useRouter();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  useEffect(() => {
    const performLogout = () => {
      let hasUser = false;

      // 1. ตรวจสอบและล้าง Session ใน Storage
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        hasUser = !!localStorage.getItem('user');
        if (hasUser) {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          window.dispatchEvent(new Event('auth-change'));
        }
      }

      // 2. เด้งไปหน้า /login ทันที (หากผู้ใช้ไม่ได้อยู่หน้า /login อยู่แล้ว)
      if (hasUser && pathnameRef.current !== '/login') {
        router.replace('/login' as any);
      }
    };

    // --- Web: ดักจับ Event จากเบราว์เซอร์ ---
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'hidden') {
          performLogout();
        }
      };

      const handlePageHide = () => {
        performLogout();
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('pagehide', handlePageHide);
      window.addEventListener('beforeunload', handlePageHide);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('pagehide', handlePageHide);
        window.removeEventListener('beforeunload', handlePageHide);
      };
    }

    // --- Mobile (iOS / Android): ดักจับ Lifecycle ของแอป ---
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'inactive' || nextAppState === 'background') {
        performLogout();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [router]);
}
