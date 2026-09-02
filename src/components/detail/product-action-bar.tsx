/**
 * @file product-action-bar.tsx
 * @description แถบดำเนินการสั่งซื้อสินค้า (Add to Cart / Buy Now / Admin Actions) สไตล์ Minecraft Voxel Design System
 * 0px Voxel Doctrine, Primary Fill (#3c8527), Buy Now (#6cc349), และ Admin Controls (#007AFF / #ff605e)
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
  onBuyNow?: () => void;
  addedSuccess?: boolean;
  isAdmin?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ProductActionBar({
  quantity,
  maxStock,
  onQuantityChange,
  onAddToCart,
  onBuyNow,
  addedSuccess = false,
  isAdmin = false,
  onEdit,
  onDelete,
}: ProductActionBarProps) {
  const theme = useTheme();
  const isOutOfStock = maxStock <= 0;

  return (
    <View style={styles.container}>
      {/* ส่วนเลือกจำนวนสินค้า */}
      <View style={styles.quantityRow}>
        <ThemedText type="smallBold">Quantity:</ThemedText>
        <View style={[styles.quantityStepper, { backgroundColor: theme.background }]}>
          <Pressable
            onPress={() => onQuantityChange(Math.max(1, quantity - 1))}
            disabled={quantity <= 1 || isOutOfStock}
            style={({ pressed }) => [
              styles.stepBtn,
              (pressed || quantity <= 1) && styles.stepBtnDisabled,
            ]}
          >
            <ThemedText style={styles.stepBtnText}>-</ThemedText>
          </Pressable>

          <ThemedText style={styles.quantityValue}>{quantity}</ThemedText>

          <Pressable
            onPress={() => onQuantityChange(Math.min(maxStock, quantity + 1))}
            disabled={quantity >= maxStock || isOutOfStock}
            style={({ pressed }) => [
              styles.stepBtn,
              (pressed || quantity >= maxStock) && styles.stepBtnDisabled,
            ]}
          >
            <ThemedText style={styles.stepBtnText}>+</ThemedText>
          </Pressable>
        </View>
      </View>

      {/* ปุ่มสั่งซื้อและเพิ่มลงตะกร้า */}
      <View style={styles.purchaseButtonsRow}>
        <Pressable
          onPress={onAddToCart}
          disabled={isOutOfStock}
          style={({ pressed }) => [
            styles.addToCartBtn,
            isOutOfStock && styles.btnDisabled,
            pressed && styles.pressed,
          ]}
        >
          <SymbolView
            tintColor="#ffffff"
            name={{ ios: 'cart.badge.plus', android: 'add_shopping_cart', web: 'add_shopping_cart' } as any}
            size={18}
          />
          <ThemedText type="smallBold" style={styles.addToCartText}>
            {addedSuccess ? '✓ เพิ่มแล้ว!' : isOutOfStock ? 'สินค้าหมด' : 'Add to Cart'}
          </ThemedText>
        </Pressable>

        {onBuyNow && (
          <Pressable
            onPress={onBuyNow}
            disabled={isOutOfStock}
            style={({ pressed }) => [
              styles.buyNowBtn,
              isOutOfStock && styles.btnDisabled,
              pressed && styles.pressed,
            ]}
          >
            <ThemedText type="smallBold" style={styles.buyNowText}>
              Buy Now
            </ThemedText>
          </Pressable>
        )}
      </View>

      {/* ปุ่มจัดการสินค้าสำหรับ Admin */}
      {isAdmin && (
        <View style={styles.adminSection}>
          <View style={[styles.divider, { backgroundColor: '#3d3938' }]} />
          <ThemedText type="smallBold" style={styles.adminLabel}>
            Admin Controls
          </ThemedText>
          <View style={styles.adminButtonsRow}>
            {onEdit && (
              <Pressable
                onPress={onEdit}
                style={({ pressed }) => [
                  styles.adminBtn,
                  { backgroundColor: '#007AFF' },
                  pressed && styles.pressed,
                ]}
              >
                <SymbolView
                  tintColor="#ffffff"
                  name={{ ios: 'square.and.pencil', android: 'edit', web: 'edit' } as any}
                  size={16}
                />
                <ThemedText type="smallBold" style={{ color: '#ffffff' }}>
                  แก้ไขสินค้า
                </ThemedText>
              </Pressable>
            )}

            {onDelete && (
              <Pressable
                onPress={onDelete}
                style={({ pressed }) => [
                  styles.adminBtn,
                  { backgroundColor: '#ff605e' },
                  pressed && styles.pressed,
                ]}
              >
                <SymbolView
                  tintColor="#ffffff"
                  name={{ ios: 'trash', android: 'delete', web: 'delete' } as any}
                  size={16}
                />
                <ThemedText type="smallBold" style={{ color: '#ffffff' }}>
                  ลบสินค้า
                </ThemedText>
              </Pressable>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 0, // 0px voxel doctrine
    borderWidth: 1,
    borderColor: '#3d3938',
    overflow: 'hidden',
  },
  stepBtn: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 36,
  },
  stepBtnDisabled: {
    opacity: 0.3,
  },
  stepBtnText: {
    fontSize: 18,
    fontWeight: '700',
  },
  quantityValue: {
    paddingHorizontal: Spacing.three,
    fontSize: 15,
    fontWeight: '700',
    minWidth: 32,
    textAlign: 'center',
  },
  purchaseButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  addToCartBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: 15,
    paddingHorizontal: Spacing.three,
    borderRadius: 0, // 0px voxel doctrine
    backgroundColor: '#3c8527', // vanilla-green-5
    borderWidth: 2,
    borderColor: '#262423',
  },
  addToCartText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.54,
  },
  buyNowBtn: {
    flex: 1,
    backgroundColor: '#6cc349', // vanilla-green-3
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: 15,
    paddingHorizontal: Spacing.three,
    borderRadius: 0, // 0px voxel doctrine
    borderWidth: 2,
    borderColor: '#3c8527',
  },
  buyNowText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.54,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  adminSection: {
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  divider: {
    height: 1,
    width: '100%',
  },
  adminLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#d0c5c0',
  },
  adminButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  adminBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    paddingVertical: 12,
    paddingHorizontal: Spacing.three,
    borderRadius: 0, // 0px voxel doctrine
    borderWidth: 2,
    borderColor: '#262423',
  },
  pressed: {
    opacity: 0.75,
  },
});
