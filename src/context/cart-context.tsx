/**
 * @file cart-context.tsx
 * @description React Context จัดการสถานะตะกร้าสินค้า (Cart State Management)
 * รองรับการเพิ่ม/ลดสินค้า, การคำนวณราคา, ระบบคูปองส่วนลด และการซิงค์ข้อมูลกับ LocalStorage
 */

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { getStorageItem, setStorageItem, removeStorageItem, getStorageJSON, subscribeStorageChange, emitStorageChange } from '@/utils/storage';

/** โครงสร้างข้อมูลสินค้าแต่ละชิ้นในตะกร้า */
export interface CartItem {
  id: string | number;
  name: string;
  price: number | string;
  quantity: number;
  image?: string;
  category?: string;
  stock?: number;
}

/** โครงสร้างข้อมูลคูปองส่วนลด */
export interface Coupon {
  code: string;
  discountPercent?: number;
  discountAmount?: number;
  description: string;
  minSpend?: number;
}

/** คูปองส่วนลดที่เปิดให้ใช้งานได้ในระบบ */
export const AVAILABLE_COUPONS: Coupon[] = [
  {
    code: 'EXTREME10',
    discountPercent: 10,
    description: 'ลดทันที 10% เมื่อซื้อคีย์บอร์ดทุกชิ้น',
  },
  {
    code: 'FREESHIP',
    discountAmount: 15,
    description: 'ฟรีค่าจัดส่ง (ลดสูงสุด $15)',
    minSpend: 50,
  },
  {
    code: 'KEYBOARD20',
    discountPercent: 20,
    description: 'ลดพิเศษ 20% สำหรับยอดสั่งซื้อ $100 ขึ้นไป',
    minSpend: 100,
  },
];

interface CartContextType {
  items: CartItem[];
  addToCart: (product: {
    id: string | number;
    name: string;
    price: number | string;
    image?: string;
    category?: string;
    stock?: number;
  }, quantity?: number) => void;
  removeFromCart: (id: string | number) => void;
  updateQuantity: (id: string | number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  shippingFee: number;
  discount: number;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  grandTotal: number;
}

const CART_STORAGE_KEY = 'extreme_keys_cart';
const COUPON_STORAGE_KEY = 'extreme_keys_coupon';

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // โหลดข้อมูลเริ่มต้นจาก Storage (อ่านจาก in-memory cache ที่ initStorage() โหลดมาแล้ว)
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      return getStorageJSON<CartItem[]>(CART_STORAGE_KEY, []);
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
    try {
      return getStorageJSON<Coupon | null>(COUPON_STORAGE_KEY, null);
    } catch {
      return null;
    }
  });

  // บันทึกตะกร้าลง Storage เมื่อมีการเปลี่ยนแปลง
  const persistCart = useCallback((newItems: CartItem[]) => {
    setItems(newItems);
    try {
      setStorageItem(CART_STORAGE_KEY, JSON.stringify(newItems));
      emitStorageChange('cart-change');
    } catch (e) {
      console.error('Failed to persist cart', e);
    }
  }, []);

  // บันทึกคูปองลง Storage
  const persistCoupon = useCallback((coupon: Coupon | null) => {
    setAppliedCoupon(coupon);
    try {
      if (coupon) {
        setStorageItem(COUPON_STORAGE_KEY, JSON.stringify(coupon));
      } else {
        removeStorageItem(COUPON_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to persist coupon', e);
    }
  }, []);

  // ซิงค์การเปลี่ยนแปลงจากแท็บอื่นๆ (บน Web) หรือ Process อื่น
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const savedCart = getStorageItem(CART_STORAGE_KEY);
        if (savedCart) setItems(JSON.parse(savedCart));
        const savedCoupon = getStorageItem(COUPON_STORAGE_KEY);
        setAppliedCoupon(savedCoupon ? JSON.parse(savedCoupon) : null);
      } catch {}
    };
    return subscribeStorageChange('cart-change', handleStorageChange);
  }, []);

  /**
   * เพิ่มสินค้าลงในตะกร้า
   */
  const addToCart = useCallback(
    (
      product: {
        id: string | number;
        name: string;
        price: number | string;
        image?: string;
        category?: string;
        stock?: number;
      },
      quantity: number = 1
    ) => {
      setItems((prevItems) => {
        const existingIndex = prevItems.findIndex((item) => String(item.id) === String(product.id));
        let updated: CartItem[];

        if (existingIndex > -1) {
          updated = [...prevItems];
          const newQty = updated[existingIndex].quantity + quantity;
          const maxStock = product.stock !== undefined ? product.stock : 99;
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: Math.min(newQty, maxStock),
          };
        } else {
          updated = [
            ...prevItems,
            {
              id: product.id,
              name: product.name,
              price: Number(product.price) || 0,
              quantity: Math.min(quantity, product.stock !== undefined ? product.stock : 99),
              image: product.image,
              category: product.category,
              stock: product.stock,
            },
          ];
        }

        // Persist ทันทีผ่าน Universal Storage
        try {
          setStorageItem(CART_STORAGE_KEY, JSON.stringify(updated));
          emitStorageChange('cart-change');
        } catch {}

        return updated;
      });
    },
    []
  );

  /**
   * ลบสินค้าออกจากตะกร้า
   */
  const removeFromCart = useCallback(
    (id: string | number) => {
      setItems((prev) => {
        const updated = prev.filter((item) => String(item.id) !== String(id));
        // Persist ทันทีผ่าน Universal Storage
        try {
          setStorageItem(CART_STORAGE_KEY, JSON.stringify(updated));
          emitStorageChange('cart-change');
        } catch {}
        return updated;
      });
    },
    []
  );

  /**
   * อัปเดตจำนวนสินค้า
   */
  const updateQuantity = useCallback(
    (id: string | number, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(id);
        return;
      }
      setItems((prev) => {
        const updated = prev.map((item) =>
          String(item.id) === String(id) ? { ...item, quantity } : item
        );
        // Persist ทันทีผ่าน Universal Storage
        try {
          setStorageItem(CART_STORAGE_KEY, JSON.stringify(updated));
          emitStorageChange('cart-change');
        } catch {}
        return updated;
      });
    },
    [removeFromCart]
  );

  /**
   * เคลียร์สินค้าทั้งหมดในตะกร้า
   */
  const clearCart = useCallback(() => {
    persistCart([]);
    persistCoupon(null);
  }, [persistCart, persistCoupon]);

  // คำนวณจำนวนชิ้นทั้งหมด
  const totalItems = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  // คำนวณยอดเงินรวมก่อนส่วนลด
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  }, [items]);

  // คำนวณค่าจัดส่ง (ซื้อครบ $100 ส่งฟรี หากไม่ถึง คิด $10)
  const shippingFee = useMemo(() => {
    if (items.length === 0) return 0;
    return subtotal >= 100 ? 0 : 10;
  }, [items.length, subtotal]);

  /**
   * ใช้งานโค้ดส่วนลด
   */
  const applyCoupon = useCallback(
    (code: string): { success: boolean; message: string } => {
      const cleanCode = code.trim().toUpperCase();
      const found = AVAILABLE_COUPONS.find((c) => c.code === cleanCode);

      if (!found) {
        return { success: false, message: 'ไม่พบคูปองส่วนลดนี้ หรือคูปองหมดอายุ' };
      }

      if (found.minSpend && subtotal < found.minSpend) {
        return {
          success: false,
          message: `คูปองนี้ใช้ได้เมื่อมียอดสั่งซื้อขั้นต่ำ $${found.minSpend} ขึ้นไป`,
        };
      }

      persistCoupon(found);
      return { success: true, message: `ใช้งานคูปอง ${cleanCode} สำเร็จแล้ว!` };
    },
    [subtotal, persistCoupon]
  );

  /**
   * ยกเลิกการใช้คูปองส่วนลด
   */
  const removeCoupon = useCallback(() => {
    persistCoupon(null);
  }, [persistCoupon]);

  // คำนวณส่วนลดที่ได้รับ
  const discount = useMemo(() => {
    if (!appliedCoupon) return 0;

    if (appliedCoupon.minSpend && subtotal < appliedCoupon.minSpend) {
      return 0;
    }

    if (appliedCoupon.discountPercent) {
      return (subtotal * appliedCoupon.discountPercent) / 100;
    }

    if (appliedCoupon.discountAmount) {
      return Math.min(appliedCoupon.discountAmount, subtotal);
    }

    return 0;
  }, [appliedCoupon, subtotal]);

  // คำนวณยอดเงินสุทธิ
  const grandTotal = useMemo(() => {
    return Math.max(0, subtotal + shippingFee - discount);
  }, [subtotal, shippingFee, discount]);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        shippingFee,
        discount,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        grandTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

/**
 * useCart Hook สำหรับเรียกใช้งานข้อมูลตะกร้าสินค้าในคอมโพเนนต์
 */
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

