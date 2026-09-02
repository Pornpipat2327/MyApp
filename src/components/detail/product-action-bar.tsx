/**
 * @file product-action-bar.tsx
 * @description แถบควบคุมการสั่งซื้อ (ปรับจำนวน, กดเพิ่มลงตะกร้า) และปุ่มจัดการสำหรับ Admin (แก้ไข/ลบสินค้า)
 */

import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface ProductActionBarProps {
  quantity: number;
  maxStock: number;
  onQuantityChange: (qty: number) => void;
  onAddToCart: () => void;
  addedSuccess: boolean;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function ProductActionBar({
  quantity,
  maxStock,
  onQuantityChange,
  onAddToCart,
  addedSuccess,
  isAdmin,
  onEdit,
  onDelete,
}: ProductActionBarProps) {
  const theme = useTheme();
  const isOutOfStock = maxStock <= 0;

  return (
    <View style={styles.container}>
      {/* ส่วนเลือกจำนวนและปุ่ม Add to Cart */}
      <View style={styles.purchaseRow}>
        {/* ตัวเลือกจำนวน */}
        <View style={[styles.stepperBox, { borderColor: theme.border, backgroundColor: theme.backgroundElement }]}>
          <Pressable
            onPress={() => onQuantityChange(Math.max(1, quantity - 1))}
            disabled={quantity <= 1 || isOutOfStock}
            style={({ pressed }) => [styles.stepperBtn, (pressed || quantity <= 1) && { opacity: 0.5 }]}
          >
            <ThemedText style={styles.stepperSymbol}>-</ThemedText>
          </Pressable>

          <ThemedText type="smallBold" style={styles.quantityText}>
            {quantity}
          </ThemedText>

          <Pressable
            onPress={() => onQuantityChange(Math.min(maxStock, quantity + 1))}
            disabled={quantity >= maxStock || isOutOfStock}
            style={({ pressed }) => [
              styles.stepperBtn,
              (pressed || quantity >= maxStock) && { opacity: 0.5 },
            ]}
          >
            <ThemedText style={styles.stepperSymbol}>+</ThemedText>
          </Pressable>
        </View>

        {/* ปุ่ม Add to Cart */}
        <Pressable
          onPress={onAddToCart}
          disabled={isOutOfStock}
          style={({ pressed }) => [
            styles.addToCartBtn,
            { backgroundColor: addedSuccess ? '#34C759' : '#6cc349' },
            (pressed || isOutOfStock) && { opacity: 0.7 },
          ]}
        >
          <SymbolView
            tintColor="#ffffff"
            name={{ ios: 'cart.badge.plus', android: 'add_shopping_cart', web: 'add_shopping_cart' } as any}
            size={20}
          />
          <ThemedText type="smallBold" style={styles.btnText}>
            {isOutOfStock
              ? 'สินค้าหมด'
              : addedSuccess
              ? 'เพิ่มลงตะกร้าแล้ว! ✓'
              : 'เพิ่มลงตะกร้า (Add to Cart)'}
          </ThemedText>
        </Pressable>
      </View>

      {/* ปุ่มจัดการสำหรับ Admin (แก้ไข/ลบ) */}
      {isAdmin && (
        <View style={styles.adminRow}>
          <Pressable
            onPress={onEdit}
            style={({ pressed }) => [styles.editBtn, pressed && styles.pressed]}
          >
            <SymbolView
              tintColor="#007AFF"
              name={{ ios: 'pencil', android: 'edit', web: 'edit' } as any}
              size={16}
            />
            <ThemedText type="smallBold" style={{ color: '#007AFF' }}>
              แก้ไขสินค้า
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={onDelete}
            style={({ pressed }) => [styles.deleteBtn, pressed && styles.pressed]}
          >
            <SymbolView
              tintColor="#FF3B30"
              name={{ ios: 'trash', android: 'delete', web: 'delete' } as any}
              size={16}
            />
            <ThemedText type="smallBold" style={{ color: '#FF3B30' }}>
              ลบสินค้า
            </ThemedText>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
  purchaseRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
  },
  stepperBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 6,
    height: 48,
  },
  stepperBtn: {
    paddingHorizontal: 16,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperSymbol: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityText: {
    paddingHorizontal: 12,
    fontSize: 16,
  },
  addToCartBtn: {
    flex: 1,
    height: 48,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnText: {
    color: '#ffffff',
    fontSize: 15,
  },
  adminRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: 4,
  },
  editBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.two,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  deleteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.two,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
  },
  pressed: {
    opacity: 0.7,
  },
});
