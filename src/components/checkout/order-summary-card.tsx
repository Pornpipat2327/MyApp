/**
 * @file order-summary-card.tsx
 * @description การ์ดสรุปรายการสินค้า ค่าจัดส่ง ส่วนลด ยอดรวมสุทธิ และปุ่มยืนยันการสั่งซื้อ
 */

import React from 'react';
import { StyleSheet, View, Image, Pressable, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { CartItem, Coupon } from '@/hooks/use-cart';
import { getImageSource } from '@/utils/image';

interface OrderSummaryCardProps {
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  grandTotal: number;
  appliedCoupon: Coupon | null;
  loading: boolean;
  onPlaceOrder: () => void;
}

export function OrderSummaryCard({
  items,
  subtotal,
  shippingFee,
  discount,
  grandTotal,
  appliedCoupon,
  loading,
  onPlaceOrder,
}: OrderSummaryCardProps) {
  const theme = useTheme();

  return (
    <ThemedView type="backgroundElement" style={styles.summaryCard}>
      <ThemedText type="smallBold" style={styles.summaryTitle}>
        สรุปคำสั่งซื้อ ({items.length} รายการ)
      </ThemedText>

      {/* รายการสินค้าที่สั่งซื้อ */}
      <View style={styles.itemsList}>
        {items.map((item) => {
          const imgSrc = getImageSource(item.image);
          return (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemThumbnailBox}>
                {imgSrc ? (
                  <Image source={imgSrc} style={styles.itemThumbnail} resizeMode="cover" />
                ) : (
                  <View style={[styles.itemThumbnail, { backgroundColor: theme.background }]} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText type="smallBold" numberOfLines={1}>
                  {item.name}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  จำนวน: {item.quantity} ชิ้น
                </ThemedText>
              </View>
              <ThemedText type="smallBold">
                ${(Number(item.price) * item.quantity).toFixed(2)}
              </ThemedText>
            </View>
          );
        })}
      </View>

      {/* ข้อมูลคูปองส่วนลดที่ใช้งาน */}
      {appliedCoupon && (
        <View style={styles.appliedCouponBadge}>
          <ThemedText type="small" style={{ color: '#34C759', fontWeight: '600' }}>
            🎉 ใช้งานคูปอง: {appliedCoupon.code} (-${discount.toFixed(2)})
          </ThemedText>
        </View>
      )}

      {/* แจกแจงยอดเงิน */}
      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <View style={styles.priceRow}>
        <ThemedText type="small" themeColor="textSecondary">
          ยอดรวมสินค้า (Subtotal)
        </ThemedText>
        <ThemedText type="smallBold">${subtotal.toFixed(2)}</ThemedText>
      </View>

      <View style={styles.priceRow}>
        <ThemedText type="small" themeColor="textSecondary">
          ค่าจัดส่ง (Shipping)
        </ThemedText>
        <ThemedText type="smallBold">
          {shippingFee === 0 ? 'ส่งฟรี (Free)' : `$${shippingFee.toFixed(2)}`}
        </ThemedText>
      </View>

      {discount > 0 && (
        <View style={styles.priceRow}>
          <ThemedText type="small" style={{ color: '#34C759' }}>
            ส่วนลด (Discount)
          </ThemedText>
          <ThemedText type="smallBold" style={{ color: '#34C759' }}>
            -${discount.toFixed(2)}
          </ThemedText>
        </View>
      )}

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      {/* ยอดเงินรวมสุทธิ */}
      <View style={styles.priceRow}>
        <ThemedText type="subtitle" style={{ fontSize: 16 }}>
          ยอดชำระสุทธิ
        </ThemedText>
        <ThemedText type="subtitle" style={{ color: '#6cc349', fontSize: 20 }}>
          ${grandTotal.toFixed(2)}
        </ThemedText>
      </View>

      {/* ปุ่มยืนยันการสั่งซื้อ */}
      <Pressable
        onPress={onPlaceOrder}
        disabled={loading || items.length === 0}
        style={({ pressed }) => [
          styles.submitButton,
          { backgroundColor: '#6cc349' },
          (pressed || loading || items.length === 0) && { opacity: 0.7 },
        ]}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <ThemedText type="smallBold" style={styles.submitButtonText}>
            ยืนยันการสั่งซื้อ (${grandTotal.toFixed(2)})
          </ThemedText>
        )}
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.15)',
    gap: Spacing.three,
  },
  summaryTitle: {
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.1)',
    paddingBottom: Spacing.two,
  },
  itemsList: {
    gap: Spacing.two,
    maxHeight: 250,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  itemThumbnailBox: {
    width: 44,
    height: 44,
    borderRadius: 4,
    overflow: 'hidden',
  },
  itemThumbnail: {
    width: '100%',
    height: '100%',
  },
  appliedCouponBadge: {
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    padding: Spacing.two,
    borderRadius: 4,
    alignItems: 'center',
  },
  divider: {
    height: 1,
    marginVertical: 2,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  submitButton: {
    paddingVertical: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    marginTop: Spacing.two,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 15,
  },
});
