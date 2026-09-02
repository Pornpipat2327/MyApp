/**
 * @file order-success-modal.tsx
 * @description หน้าต่างแจ้งเตือนเมื่อสั่งซื้อสินค้าสำเร็จ สไตล์ Minecraft Voxel Design System
 * 0px Voxel Doctrine, Dark Border (#3d3938), และ Success Primary Button (#3c8527)
 */

import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { Order } from '@/types/order';

interface OrderSuccessModalProps {
  order: Order;
}

export function OrderSuccessModal({ order }: OrderSuccessModalProps) {
  const router = useRouter();

  return (
    <ThemedView type="backgroundElement" style={styles.successCard}>
      <View style={styles.successIconCircle}>
        <SymbolView
          tintColor="#6cc349"
          name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' } as any}
          size={64}
        />
      </View>

      <ThemedText type="subtitle" style={styles.successTitle}>
        Order Placed Successfully! 🎉
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.successSubtitle}>
        ขอบคุณสำหรับการสั่งซื้อ ออเดอร์คีย์บอร์ดของคุณได้รับการบันทึกและพร้อมจัดส่งแล้ว
      </ThemedText>

      {/* กล่องรายละเอียดออเดอร์ */}
      <View style={[styles.orderInfoBox, { backgroundColor: '#262423' }]}>
        <View style={styles.infoRow}>
          <ThemedText type="small" themeColor="textSecondary">
            Order ID:
          </ThemedText>
          <ThemedText type="smallBold" style={{ color: '#6cc349' }}>
            #{order.id}
          </ThemedText>
        </View>

        <View style={styles.infoRow}>
          <ThemedText type="small" themeColor="textSecondary">
            เลขพัสดุ (Tracking):
          </ThemedText>
          <ThemedText type="smallBold">{order.trackingNumber}</ThemedText>
        </View>

        <View style={styles.infoRow}>
          <ThemedText type="small" themeColor="textSecondary">
            ผู้รับ:
          </ThemedText>
          <ThemedText type="smallBold">{order.shippingAddress.recipientName}</ThemedText>
        </View>

        <View style={styles.infoRow}>
          <ThemedText type="small" themeColor="textSecondary">
            ช่องทางชำระเงิน:
          </ThemedText>
          <ThemedText type="smallBold" style={{ textTransform: 'uppercase' }}>
            {order.paymentMethod}
          </ThemedText>
        </View>

        <View style={styles.infoRow}>
          <ThemedText type="small" themeColor="textSecondary">
            ยอดชำระสุทธิ:
          </ThemedText>
          <ThemedText type="smallBold" style={{ color: '#6cc349', fontSize: 16 }}>
            ${order.totalAmount.toFixed(2)}
          </ThemedText>
        </View>
      </View>

      {/* ปุ่มกดดูออเดอร์ หรือ กลับหน้าร้าน */}
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
    borderRadius: 0, // 0px voxel doctrine
    alignItems: 'center',
    gap: Spacing.three,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#3d3938',
  },
  successIconCircle: {
    marginBottom: Spacing.one,
  },
  successTitle: {
    fontSize: 22,
    textAlign: 'center',
    fontWeight: '800',
  },
  successSubtitle: {
    textAlign: 'center',
    maxWidth: 420,
  },
  orderInfoBox: {
    width: '100%',
    padding: Spacing.three,
    borderRadius: 0, // 0px voxel doctrine
    borderWidth: 1,
    borderColor: '#3d3938',
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
    backgroundColor: '#3c8527', // vanilla-green-5
    borderWidth: 2,
    borderColor: '#262423',
    paddingVertical: Spacing.three,
    borderRadius: 0, // 0px voxel doctrine
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
