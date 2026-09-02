/**
 * @file order-summary-card.tsx
 * @description การ์ดสรุปรายการสินค้าและยอดเงินในหน้า Checkout สไตล์ Minecraft Voxel Design System
 * 0px Voxel Doctrine, Dark Border (#3d3938), Primary Button (#3c8527), และ Eyebrow Titles (#d0c5c0)
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
        สรุปคำสั่งซื้อ (Order Review)
      </ThemedText>

      {/* รายการสินค้าในตะกร้า */}
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
                  {item.quantity} × ${Number(item.price).toFixed(2)}
                </ThemedText>
              </View>
              <ThemedText type="smallBold">
                ${(Number(item.price) * item.quantity).toFixed(2)}
              </ThemedText>
            </View>
          );
        })}
      </View>

      {/* คูปองส่วนลดที่ใช้งาน */}
      {appliedCoupon && (
        <View style={styles.appliedCouponBadge}>
          <ThemedText type="smallBold" style={{ color: '#6cc349', fontSize: 12 }}>
            🏷️ คูปอง: {appliedCoupon.code}
          </ThemedText>
        </View>
      )}

      <View style={[styles.divider, { backgroundColor: '#3d3938' }]} />

      {/* คำนวณราคา */}
      <View style={styles.priceRow}>
        <ThemedText type="small" themeColor="textSecondary">
          ยอดรวมสินค้า
        </ThemedText>
        <ThemedText type="smallBold">${subtotal.toFixed(2)}</ThemedText>
      </View>

      <View style={styles.priceRow}>
        <ThemedText type="small" themeColor="textSecondary">
          ค่าจัดส่ง (Shipping)
        </ThemedText>
        <ThemedText type="smallBold">
          {shippingFee === 0 ? 'ฟรี (Free)' : `$${shippingFee.toFixed(2)}`}
        </ThemedText>
      </View>

      {discount > 0 && (
        <View style={styles.priceRow}>
          <ThemedText type="small" style={{ color: '#6cc349' }}>
            ส่วนลด (Discount)
          </ThemedText>
          <ThemedText type="smallBold" style={{ color: '#6cc349' }}>
            -${discount.toFixed(2)}
          </ThemedText>
        </View>
      )}

      <View style={[styles.divider, { backgroundColor: '#3d3938' }]} />

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
    borderColor: '#3d3938',
    gap: Spacing.three,
    borderRadius: 0, // 0px voxel doctrine
  },
  summaryTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: '#d0c5c0',
    borderBottomWidth: 1,
    borderBottomColor: '#3d3938',
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
    borderRadius: 0, // 0px voxel doctrine
    overflow: 'hidden',
  },
  itemThumbnail: {
    width: '100%',
    height: '100%',
  },
  appliedCouponBadge: {
    backgroundColor: 'rgba(108, 195, 73, 0.15)',
    padding: Spacing.two,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#6cc349',
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: Spacing.one,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  submitButton: {
    paddingVertical: 15,
    borderRadius: 0, // 0px voxel doctrine
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.two,
    backgroundColor: '#3c8527', // vanilla-green-5
    borderWidth: 2,
    borderColor: '#262423',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.54,
  },
});
