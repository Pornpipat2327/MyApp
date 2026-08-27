import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Platform } from 'react-native';

export interface CartItem {
  id: string | number;
  name: string;
  price: number;
  image?: string;
  category?: string;
  stock?: number;
  location_text?: string;
  quantity: number;
}

export interface Coupon {
  code: string;
  discountPercent: number;
  description: string;
}

export const AVAILABLE_COUPONS: Coupon[] = [
  { code: 'PROMO10', discountPercent: 10, description: '10% off on all items' },
  { code: 'KEYBOARD20', discountPercent: 20, description: '20% off for keyboard lovers' },
  { code: 'VIP50', discountPercent: 50, description: 'Special 50% discount for VIP' },
];

export interface CartContextType {
  items: CartItem[];
  addToCart: (product: any, quantity?: number) => void;
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

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
          setItems(JSON.parse(savedCart));
        }
        const savedCoupon = localStorage.getItem(COUPON_STORAGE_KEY);
        if (savedCoupon) {
          setAppliedCoupon(JSON.parse(savedCoupon));
        }
      } catch (e) {
        console.error('Failed to load cart from storage', e);
      }
    }
  }, []);

  // Sync to localStorage
  const saveCart = (newItems: CartItem[]) => {
    setItems(newItems);
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newItems));
        window.dispatchEvent(new Event('cart-change'));
      } catch (e) {
        console.error('Failed to save cart', e);
      }
    }
  };

  const saveCoupon = (coupon: Coupon | null) => {
    setAppliedCoupon(coupon);
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        if (coupon) {
          localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(coupon));
        } else {
          localStorage.removeItem(COUPON_STORAGE_KEY);
        }
        window.dispatchEvent(new Event('cart-change'));
      } catch (e) {
        console.error('Failed to save coupon', e);
      }
    }
  };

  // Add item
  const addToCart = (product: any, quantityToAdd = 1) => {
    const productId = product.id ?? product.Product_ID ?? product._id;
    if (!productId) return;

    const rawPrice = product.price ?? product.Price ?? 0;
    const priceNum = typeof rawPrice === 'number' ? rawPrice : parseFloat(String(rawPrice).replace(/[^0-9.]/g, '')) || 0;
    const rawStock = product.stock ?? product.Stock ?? 999;
    const maxStock = typeof rawStock === 'number' ? rawStock : parseInt(String(rawStock), 10) || 999;

    const existingIndex = items.findIndex((item) => String(item.id) === String(productId));

    let updatedItems: CartItem[];
    if (existingIndex > -1) {
      updatedItems = [...items];
      const newQty = Math.min(updatedItems[existingIndex].quantity + quantityToAdd, maxStock);
      updatedItems[existingIndex] = {
        ...updatedItems[existingIndex],
        quantity: newQty,
      };
    } else {
      const newItem: CartItem = {
        id: productId,
        name: product.name ?? product.Name ?? 'Keyboard Product',
        price: priceNum,
        image: product.image ?? product.Image ?? product.image_url ?? '',
        category: product.category ?? product.Category ?? '',
        stock: maxStock,
        location_text: product.location_text ?? product.location ?? product.Location ?? '',
        quantity: Math.min(quantityToAdd, maxStock),
      };
      updatedItems = [...items, newItem];
    }

    saveCart(updatedItems);
  };

  // Remove item
  const removeFromCart = (id: string | number) => {
    const updated = items.filter((item) => String(item.id) !== String(id));
    saveCart(updated);
  };

  // Update quantity
  const updateQuantity = (id: string | number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    const updated = items.map((item) => {
      if (String(item.id) === String(id)) {
        const maxStock = item.stock ?? 999;
        return {
          ...item,
          quantity: Math.min(quantity, maxStock),
        };
      }
      return item;
    });

    saveCart(updated);
  };

  // Clear cart
  const clearCart = () => {
    saveCart([]);
    saveCoupon(null);
  };

  // Apply Coupon
  const applyCoupon = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    const found = AVAILABLE_COUPONS.find((c) => c.code === cleanCode);
    if (found) {
      saveCoupon(found);
      return { success: true, message: `Coupon applied: ${found.description}` };
    }
    return { success: false, message: 'Invalid coupon code. Try "PROMO10" or "KEYBOARD20"' };
  };

  // Remove Coupon
  const removeCoupon = () => {
    saveCoupon(null);
  };

  // Calculations
  const totalItems = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  // Free shipping for orders over $100, otherwise $10 flat rate (if items > 0)
  const shippingFee = useMemo(() => {
    if (items.length === 0) return 0;
    return subtotal >= 100 ? 0 : 10;
  }, [items, subtotal]);

  const discount = useMemo(() => {
    if (!appliedCoupon || subtotal === 0) return 0;
    return (subtotal * appliedCoupon.discountPercent) / 100;
  }, [appliedCoupon, subtotal]);

  const grandTotal = useMemo(() => {
    return Math.max(0, subtotal - discount + shippingFee);
  }, [subtotal, discount, shippingFee]);

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

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
