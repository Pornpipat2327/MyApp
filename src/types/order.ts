/**
 * @file order.ts
 * @description นิยามประเภทข้อมูลสำหรับคำสั่งซื้อ (Orders), ที่อยู่จัดส่ง และรูปแบบการชำระเงิน
 */

import { CartItem } from '@/hooks/use-cart';

/** สถานะของคำสั่งซื้อ */
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered';

/** ช่องทางการชำระเงิน */
export type PaymentMethod = 'promptpay' | 'bank_transfer' | 'cod';

/** สถานะการชำระเงิน */
export type PaymentStatus = 'paid' | 'pending';

/** ข้อมูลที่อยู่สำหรับจัดส่งพัสดุ */
export interface ShippingAddress {
  /** ชื่อ-นามสกุล ผู้รับ */
  recipientName: string;
  /** หมายเลขโทรศัพท์ติดต่อ */
  phone: string;
  /** ที่อยู่ อาคาร บ้านเลขที่ */
  address: string;
  /** เมือง / เขต / จังหวัด */
  city: string;
  /** รหัสไปรษณีย์ */
  postalCode: string;
  /** หมายเหตุเพิ่มเติมในการจัดส่ง */
  note?: string;
}

/** โครงสร้างข้อมูลใบสั่งซื้อ */
export interface Order {
  /** รหัสคำสั่งซื้อ (เช่น EK-84920) */
  id: string;
  /** ชื่อบัญชีผู้สั่งซื้อ */
  username: string;
  /** สิทธิ์ของผู้สั่งซื้อ (user หรือ admin) */
  userRole?: string;
  /** วันเวลาที่ทำการสั่งซื้อ (ISO Date String) */
  createdAt: string;
  /** สถานะการจัดส่ง */
  status: OrderStatus;
  /** รายการสินค้าที่สั่งซื้อ */
  items: CartItem[];
  /** ราคารวมสินค้าก่อนหักส่วนลด */
  subtotal: number;
  /** ค่าบริการจัดส่ง */
  shippingFee: number;
  /** มูลค่าส่วนลดที่ได้รับ */
  discount: number;
  /** ยอดเงินสุทธิที่ต้องชำระ */
  totalAmount: number;
  /** โค้ดคูปองส่วนลดที่ใช้งาน (ถ้ามี) */
  couponCode?: string;
  /** ข้อมูลที่อยู่จัดส่ง */
  shippingAddress: ShippingAddress;
  /** วิธีการชำระเงินที่เลือก */
  paymentMethod: PaymentMethod;
  /** สถานะการชำระเงิน */
  paymentStatus: PaymentStatus;
  /** หมายเลขพัสดุสำหรับติดตามสถานะ */
  trackingNumber?: string;
}
