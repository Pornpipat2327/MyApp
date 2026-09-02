/**
 * @file use-color-scheme.web.ts
 * @description Hook ตรวจสอบและดึง Color Scheme (light/dark) สำหรับแพลตฟอร์ม Web
 * ใช้ useSyncExternalStore ตามมาตรฐาน React 18/19 เพื่อขจัด Hydration Mismatch และ Cascading Renders
 */

import { useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

const emptySubscribe = () => () => {};

/**
 * useColorScheme Hook (Web Implementation)
 * ตรวจจับสถานะ Hydration เพื่อป้องกันการแสดงผลผิดพลาดระหว่าง Server และ Client
 */
export function useColorScheme() {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const colorScheme = useRNColorScheme();

  if (isClient) {
    return colorScheme;
  }

  return 'light';
}
