/**
 * @file order-success-modal.tsx
 * @description คอมโพเนนต์แสดงผลเมื่อทำการสั่งซื้อสินค้าสำเร็จ พร้อมรหัสคำสั่งซื้อและหมายเลขพัสดุ
 */

import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Order } from '@/types/order';

interface OrderSuccessModalProps {
  order: Order;
}

export function OrderSuccessModal({ order }: OrderSuccessModalProps) {
  const theme = useTheme();
  const router = useRouter();

  return (
    <ThemedView type="backgroundElement" style={styles.successCard}>
      {/* วงกลมไอคอนสำเร็จ */}
      <View style={styles.successIconCircle}>
        <SymbolView
          tintColor="#34C759"
          name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' } as any}
          size={64}
        />
      </View>

      <ThemedText type="subtitle" style={styles.successTitle}>
        สั่งซื้อสินค้าสำเร็จเรียบร้อย! 🎉
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.successSubtitle}>
        ขอบคุณสำหรับการสั่งซื้อ ระบบได้รับคำสั่งซื้อคีย์บอร์ดของคุณแล้วและกำลังเตรียมการจัดส่ง
      </ThemedText>

      {/* กล่องสรุปรายละเอียดคำสั่งซื้อ */}
      <View style={[styles.orderInfoBox, { backgroundColor: theme.background }]}>
        <View style={styles.infoRow}>
          <ThemedText type="small" themeColor="textSecondary">
            รหัสคำสั่งซื้อ (Order ID)
          </ThemedText>
          <ThemedText type="smallBold" style={{ color: '#6cc349' }}>
            #{order.id}
          </ThemedText>
        </View>

        <View style={styles.infoRow}>
          <ThemedText type="small" themeColor="textSecondary">
            หมายเลขพัสดุ (Tracking No.)
          </ThemedText>
          <ThemedText type="smallBold">{order.trackingNumber}</ThemedText>
        </View>

        <View style={styles.infoRow}>
          <ThemedText type="small" themeColor="textSecondary">
            ช่องทางชำระเงิน
          </ThemedText>
          <ThemedText type="smallBold" style={{ textTransform: 'uppercase' }}>
            {order.paymentMethod}
          </ThemedText>
        </View>

        <View style={styles.infoRow}>
          <ThemedText type="small" themeColor="textSecondary">
            ยอดเงินที่ชำระ
          </ThemedText>
          <ThemedText type="smallBold" style={{ color: '#34C759', fontSize: 16 }}>
            ${order.totalAmount.toFixed(2)}
          </ThemedText>
        </View>

        <View style={styles.infoRow}>
          <ThemedText type="small" themeColor="textSecondary">
            จัดส่งถึง
          </ThemedText>
          <ThemedText type="small" style={{ textAlign: 'right', maxWidth: '60%' }}>
            {order.shippingAddress.recipientName}, {order.shippingAddress.address},{' '}
            {order.shippingAddress.city} {order.shippingAddress.postalCode}
          </ThemedText>
        </View>
      </View>

      {/* ปุ่มนำทาง */}
      <View style={styles.successActions}>
        <Pressable
          onPress={() => router.push('/orders' as any)}
          style={({ pressed }) => [styles.viewOrdersBtn, pressed && styles.pressed]}
        >
          <ThemedText type="smallBold" style={{ color: '#ffffff' }}>
            ดูรายการคำสั่งซื้อของฉัน
          </ThemedText>
        </Pressable>

        <Pressable
          onPress={() => router.push('/product')}
          style={({ pressed }) => [styles.backHomeBtn, pressed && styles.pressed]}
        >
          <ThemedText type="small" themeColor="textSecondary">
            เลือกซื้อสินค้าต่อ
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  successCard: {
    padding: Spacing.five,
    borderRadius: 8,
    alignItems: 'center',
    gap: Spacing.three,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.15)',
  },
  successIconCircle: {
    marginBottom: Spacing.one,
  },
  successTitle: {
    fontSize: 22,
    textAlign: 'center',
  },
  successSubtitle: {
    textAlign: 'center',
    maxWidth: 420,
  },
  orderInfoBox: {
    width: '100%',
    padding: Spacing.three,
    borderRadius: 6,
    gap: Spacing.two,
    marginVertical: Spacing.two,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  successActions: {
    width: '100%',
    gap: Spacing.two,
  },
  viewOrdersBtn: {
    backgroundColor: '#6cc349',
    paddingVertical: Spacing.three,
    borderRadius: 6,
    alignItems: 'center',
  },
  backHomeBtn: {
    paddingVertical: Spacing.two,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
