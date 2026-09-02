/**
 * @file product.ts
 * @description นิยามประเภทข้อมูล (Type Definitions) กลางสำหรับสินค้าและหมวดหมู่ในระบบ
 */

/**
 * โครงสร้างข้อมูลสินค้าหลัก (Product Interface)
 * ใช้ร่วมกันทุกหน้าจอ เช่น หน้าแสดงสินค้า (product), หน้าแรก (index), หน้ารายละเอียด (detail)
 */
export interface Product {
  /** รหัสประจำตัวสินค้า (รองรับทั้งตัวเลขและข้อความ) */
  id: string | number;
  /** ชื่อสินค้า */
  name: string;
  /** หมวดหมู่ของสินค้า (เช่น Wireless, Gaming, Mechanical) */
  category?: string;
  /** ราคาสินค้า */
  price: string | number;
  /** คะแนนดาวเฉลี่ย (0.0 - 5.0) */
  rating?: string | number;
  /** คำอธิบายรายละเอียดสินค้า */
  description?: string;
  /** ลิงก์ URL หรือ Path ของรูปภาพสินค้า */
  image?: string;
  /** จำนวนสินค้าคงเหลือในคลัง */
  stock?: number;
  /** ข้อความระบุตำแหน่งจัดเก็บหรือที่ตั้งสินค้า */
  location?: string;
}

/**
 * ข้อมูลสินค้าแบบย่อสำหรับระบบ Search Auto-complete และ Quick Dropdown
 */
export interface QuickProduct {
  id: string | number;
  name: string;
  category?: string;
  price: string | number;
  image?: string;
}

/**
 * ข้อมูลสำหรับฟอร์มสร้างและแก้ไขสินค้า (Product Form Data)
 */
export interface ProductFormData {
  id?: string;
  name: string;
  category?: string;
  price?: number | string;
  stock?: number | string;
  location_text?: string;
  image_url?: string;
  description?: string;
  rating?: number;
}

/**
 * ข้อมูลหมวดหมู่สินค้า (Category Interface)
 */
export interface ProductCategory {
  /** รหัสประจำตัวหมวดหมู่ */
  id: string;
  /** ชื่อหมวดหมู่ */
  name: string;
  /** ไอคอนประจำหมวดหมู่สำหรับแต่ละแพลตฟอร์ม */
  icon: {
    ios: string;
    android: string;
    web: string;
  };
  /** จำนวนสินค้าในหมวดหมู่นี้ */
  count: number;
  /** สีประจำหมวดหมู่ (Hex Code) */
  color: string;
}
