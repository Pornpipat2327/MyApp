/**
 * @file storage.ts
 * @description Universal Storage Helper รองรับทั้ง Web (localStorage) และ Mobile (AsyncStorage)
 *
 * - In-memory Key-Value Store เพื่อให้อ่านข้อมูลได้แบบ synchronous ทันที
 * - Cross-platform Event Emitter แทน window.addEventListener สำหรับ Mobile
 * - initStorage() โหลดข้อมูลจาก AsyncStorage เข้า memory ตอนเปิดแอป
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── In-Memory Cache ──────────────────────────────────────────────────────────
// เก็บค่าใน memory เพื่อให้ read ได้แบบ sync ทันที
const memoryStore: Record<string, string> = {};

// ─── Cross-platform Event Emitter ────────────────────────────────────────────
type StorageEventCallback = () => void;
const listeners: Record<string, Set<StorageEventCallback>> = {};

/**
 * Subscribe ฟังเหตุการณ์จาก Universal Storage (ทำงานทั้งบน Mobile และ Web)
 * @returns ฟังก์ชัน unsubscribe
 */
export function subscribeStorageChange(event: string, callback: StorageEventCallback): () => void {
  if (!listeners[event]) {
    listeners[event] = new Set();
  }
  listeners[event].add(callback);
  return () => {
    listeners[event]?.delete(callback);
  };
}

/**
 * ส่งสัญญาณ Storage Event (ทำงานทั้งบน Mobile และ Web)
 */
export function emitStorageChange(event: string): void {
  // ทำงานบนทุก Platform ผ่าน in-memory listener
  listeners[event]?.forEach((cb) => {
    try {
      cb();
    } catch {}
  });

  // บน Web ส่งผ่าน window event เพิ่มเติม (backward compat)
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new Event(event));
    } catch {}
  }
}

// ─── Core Storage Operations ──────────────────────────────────────────────────

/**
 * ดึงค่าจาก Storage แบบ synchronous (อ่านจาก memory cache)
 */
export function getStorageItem(key: string): string | null {
  // อ่านจาก memory cache ก่อน (ใช้งานได้ทั้ง Web และ Mobile)
  if (key in memoryStore) {
    return memoryStore[key];
  }

  // Fallback ไปที่ localStorage สำหรับ Web
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try {
      const value = localStorage.getItem(key);
      if (value !== null) {
        memoryStore[key] = value;
      }
      return value;
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * บันทึกค่าลงใน Storage (อัปเดต memory cache + persist ลง AsyncStorage/localStorage)
 */
export function setStorageItem(key: string, value: string): void {
  // อัปเดต memory cache ทันที
  memoryStore[key] = value;

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn(`Failed to set localStorage key "${key}":`, e);
    }
  } else {
    // Mobile: persist ลง AsyncStorage (async ไม่บล็อก)
    AsyncStorage.setItem(key, value).catch((e) => {
      console.warn(`Failed to set AsyncStorage key "${key}":`, e);
    });
  }
}

/**
 * ลบข้อมูลออกจาก Storage
 */
export function removeStorageItem(key: string): void {
  // ลบจาก memory cache
  delete memoryStore[key];

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`Failed to remove localStorage key "${key}":`, e);
    }
  } else {
    AsyncStorage.removeItem(key).catch((e) => {
      console.warn(`Failed to remove AsyncStorage key "${key}":`, e);
    });
  }
}

// ─── JSON Helpers ─────────────────────────────────────────────────────────────

/**
 * ดึงและแปลง JSON จาก Storage (synchronous จาก memory cache)
 */
export function getStorageJSON<T>(key: string, fallback: T): T {
  const raw = getStorageItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * บันทึก Object เป็น JSON ลงใน Storage
 */
export function setStorageJSON<T>(key: string, data: T): void {
  try {
    setStorageItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`Failed to serialize JSON for "${key}":`, e);
  }
}

// ─── Auth Helpers ─────────────────────────────────────────────────────────────

/**
 * ดึงข้อมูลผู้ใช้ปัจจุบัน (synchronous จาก memory cache)
 */
export function getCurrentUser(): { username: string; role: string; token?: string } | null {
  return getStorageJSON('user', null);
}

/**
 * ตรวจสอบว่าผู้ใช้ปัจจุบันมีสิทธิ์เป็น Administrator หรือไม่
 */
export function isCurrentUserAdmin(): boolean {
  const user = getCurrentUser();
  return (user?.role ?? '').toLowerCase() === 'admin';
}

// ─── Initialization ───────────────────────────────────────────────────────────

let _initPromise: Promise<void> | null = null;

/**
 * โหลดข้อมูลสำคัญจาก AsyncStorage เข้า in-memory cache
 * เรียกครั้งเดียวตอนแอปเริ่มต้น (idempotent)
 */
export async function initStorage(): Promise<void> {
  if (_initPromise) return _initPromise;

  _initPromise = (async () => {
    if (Platform.OS === 'web') {
      // บน Web: localStorage พร้อมใช้ทันที ไม่ต้อง async init
      // โหลดเข้า memory cache เผื่อ key บางตัวยังไม่ได้ load
      const keysToPreload = ['user', 'token', 'extreme_keys_cart', 'extreme_keys_coupon', 'extreme_keys_recent_searches'];
      for (const key of keysToPreload) {
        try {
          const value = localStorage.getItem(key);
          if (value !== null) {
            memoryStore[key] = value;
          }
        } catch {}
      }
      return;
    }

    // Mobile: อ่านข้อมูลจาก AsyncStorage เข้า memory
    try {
      const keysToPreload = ['user', 'token', 'extreme_keys_cart', 'extreme_keys_coupon', 'extreme_keys_recent_searches'];
      const pairs = await AsyncStorage.multiGet(keysToPreload);
      for (const [key, value] of pairs) {
        if (value !== null) {
          memoryStore[key] = value;
        }
      }
    } catch (e) {
      console.warn('Failed to init storage from AsyncStorage:', e);
    }
  })();

  return _initPromise;
}
