/**
 * @file cart-summary-card.tsx
 * @description การ์ดสรุปยอดเงินในตะกร้าสินค้า สไตล์ Minecraft Voxel Design System
 * 0px Voxel Doctrine, Dark Border (#3d3938), Primary Button (#3c8527), และ Accent Voltage (#6cc349)
 */

import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface CartSummaryCardProps {
  totalItems: number;
  subtotal: number;
  shippingFee: number;
  discount: number;
  grandTotal: number;
}

export function CartSummaryCard({
  totalItems,
  subtotal,
  shippingFee,
  discount,
  grandTotal,
}: CartSummaryCardProps) {
  const theme = useTheme();
  const router = useRouter();

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <ThemedText type="smallBold" style={styles.title}>
        สรุปคำสั่งซื้อ (Order Summary)
      </ThemedText>

      <View style={styles.row}>
        <ThemedText type="small" themeColor="textSecondary">
          ยอดรวมสินค้า ({totalItems} ชิ้น)
        </ThemedText>
        <ThemedText type="smallBold">${subtotal.toFixed(2)}</ThemedText>
      </View>

      <View style={styles.row}>
        <ThemedText type="small" themeColor="textSecondary">
          ค่าจัดส่ง
        </ThemedText>
        <ThemedText type="smallBold">
          {shippingFee === 0 ? 'ฟรี (Free)' : `$${shippingFee.toFixed(2)}`}
        </ThemedText>
      </View>

      {discount > 0 && (
        <View style={styles.row}>
          <ThemedText type="small" style={{ color: '#6cc349' }}>
            ส่วนลดจากคูปอง
          </ThemedText>
          <ThemedText type="smallBold" style={{ color: '#6cc349' }}>
            -${discount.toFixed(2)}
          </ThemedText>
        </View>
      )}

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <View style={styles.row}>
        <ThemedText type="subtitle" style={{ fontSize: 16 }}>
          ยอดรวมสุทธิ
        </ThemedText>
        <ThemedText type="subtitle" style={{ color: '#6cc349', fontSize: 22 }}>
          ${grandTotal.toFixed(2)}
        </ThemedText>
      </View>

      <Pressable
        onPress={() => router.push('/checkout' as any)}
        disabled={totalItems === 0}
        style={({ pressed }) => [
          styles.checkoutBtn,
          (pressed || totalItems === 0) && { opacity: 0.7 },
        ]}
      >
        <ThemedText type="smallBold" style={{ color: '#ffffff', fontSize: 15 }}>
          ดำเนินการสั่งซื้อ (Checkout)
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.four,
    borderRadius: 0, // 0px voxel doctrine
    borderWidth: 1,
    borderColor: '#3d3938',
    gap: Spacing.two,
  },
  title: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: '#d0c5c0',
    marginBottom: Spacing.one,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.one,
  },
  checkoutBtn: {
    paddingVertical: Spacing.three,
    borderRadius: 0, // 0px voxel doctrine
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.two,
    backgroundColor: '#3c8527', // vanilla-green-5
    borderWidth: 2,
    borderColor: '#262423',
  },
});
