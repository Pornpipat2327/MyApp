/**
 * @file image.ts
 * @description ฟังก์ชันช่วยเหลือสำหรับการประมวลผลและสร้าง Image Source ของ React Native
 */

import { ImageSourcePropType } from 'react-native';
import { getBaseUrl } from '@/constants/api';

/**
 * แปลงสตริง path รูปภาพให้อยู่ในรูป Object ที่คอมโพเนนต์ Image สามารถนำไปเรนเดอร์ได้
 * รองรับทั้ง:
 * 1. URL แบบเต็ม (http://, https://)
 * 2. Data URI แบบ Base64 (data:image/...)
 * 3. Relative Path จาก Backend Server (/uploads/...)
 * 
 * @param imagePath - พาธหรือ URL ของรูปภาพ
 * @returns ImageSourcePropType หรือ null ถ้าไม่มีรูป
 */
export function getImageSource(imagePath?: string | null): ImageSourcePropType | null {
  if (!imagePath || typeof imagePath !== 'string') {
    return null;
  }

  const trimmed = imagePath.trim();
  if (!trimmed) {
    return null;
  }

  // 1. ตรวจสอบว่าเป็น Full URL หรือ Data URI หรือไม่
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:')
  ) {
    return { uri: trimmed };
  }

  // 2. ตรวจสอบว่าเป็น Static path จาก Server หรือไม่ (เช่น /uploads/photo.jpg)
  if (trimmed.startsWith('/uploads/') || trimmed.startsWith('/')) {
    const baseUrl = getBaseUrl();
    return { uri: `${baseUrl}${trimmed}` };
  }

  // 3. กรณีเป็นชื่อไฟล์เดี่ยวๆ ให้ต่อ path /uploads/ อัตโนมัติ
  return { uri: `${getBaseUrl()}/uploads/${trimmed}` };
}
