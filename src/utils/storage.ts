/**
 * @file storage.ts
 * @description ยูทิลิตี้จัดการ LocalStorage และ SessionStorage อย่างปลอดภัย (Safe Storage Helper)
 * ป้องกัน Runtime Error บนสภาพแวดล้อม Mobile หรือ Server-Side Rendering
 */

import { Platform } from 'react-native';

/**
 * ดึงค่าสตริงจาก LocalStorage อย่างปลอดภัย
 */
export function getStorageItem(key: string): string | null {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * บันทึกค่าสตริงลงใน LocalStorage
 */
export function setStorageItem(key: string, value: string): void {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn(`Failed to set localStorage key "${key}":`, e);
    }
  }
}

/**
 * ลบข้อมูลออกจาก LocalStorage
 */
export function removeStorageItem(key: string): void {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`Failed to remove localStorage key "${key}":`, e);
    }
  }
}

/**
 * ดึงและแปลง JSON จาก LocalStorage
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
 * บันทึก Object เป็น JSON ลงใน LocalStorage
 */
export function setStorageJSON<T>(key: string, data: T): void {
  try {
    setStorageItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`Failed to serialize JSON for "${key}":`, e);
  }
}

/**
 * ดึงข้อมูลผู้ใช้ปัจจุบันที่บันทึกไว้ในระบบ
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
