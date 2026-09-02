/**
 * @file api.ts
 * @description ค่าคงที่ URL ปลายทางของ Backend RESTful API endpoints ทั้งหมดในระบบ
 */

/** URL หลักของ Backend API Server */
export const API_BASE_URL = 'http://119.59.102.161:3032';

/**
 * ดึง Base URL ของ API Server
 * @returns {string} URL ฐานของระบบ API
 */
export const getBaseUrl = (): string => {
  return API_BASE_URL;
};

/**
 * ดึง Endpoint สำหรับจัดการข้อมูลสินค้า (CRUD Products)
 * @returns {string} URL สำหรับ /api/products
 */
export const getProductsApiUrl = (): string => {
  return `${API_BASE_URL}/api/products`;
};

/**
 * ดึง Endpoint สำหรับการอัปโหลดไฟล์รูปภาพ
 * @returns {string} URL สำหรับ /api/upload
 */
export const getUploadApiUrl = (): string => {
  return `${API_BASE_URL}/api/upload`;
};

/**
 * ดึง Endpoint สำหรับการเข้าสู่ระบบ (Authentication Login)
 * @returns {string} URL สำหรับ /api/auth/login
 */
export const getLoginApiUrl = (): string => {
  return `${API_BASE_URL}/api/auth/login`;
};
