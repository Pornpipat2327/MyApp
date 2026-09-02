/**
 * @file cart-summary-card.tsx
 * @description การ์ดสรุปยอดเงินในตะกร้าสินค้า และปุ่มไปยังหน้าชำระเงิน (Checkout)
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
        สรุปยอดคำสั่งซื้อ
      </ThemedText>

      <View style={styles.row}>
        <ThemedText type="small" themeColor="textSecondary">
          จำนวนสินค้า
        </ThemedText>
        <ThemedText type="smallBold">{totalItems} ชิ้น</ThemedText>
      </View>

      <View style={styles.row}>
        <ThemedText type="small" themeColor="textSecondary">
          ยอดรวมสินค้า (Subtotal)
        </ThemedText>
        <ThemedText type="smallBold">${subtotal.toFixed(2)}</ThemedText>
      </View>

      <View style={styles.row}>
        <ThemedText type="small" themeColor="textSecondary">
          ค่าจัดส่ง
        </ThemedText>
        <ThemedText type="smallBold">
          {shippingFee === 0 ? 'ส่งฟรี (Free)' : `$${shippingFee.toFixed(2)}`}
        </ThemedText>
      </View>

      {discount > 0 && (
        <View style={styles.row}>
          <ThemedText type="small" style={{ color: '#34C759' }}>
            ส่วนลดจากคูปอง
          </ThemedText>
          <ThemedText type="smallBold" style={{ color: '#34C759' }}>
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
          { backgroundColor: '#6cc349' },
          (pressed || totalItems === 0) && { opacity: 0.7 },
        ]}
      >
        <ThemedText type="smallBold" style={{ color: '#ffffff', fontSize: 16 }}>
          ดำเนินการสั่งซื้อ (Checkout)
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.four,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.15)',
    gap: Spacing.two,
  },
  title: {
    fontSize: 16,
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
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.two,
  },
});
