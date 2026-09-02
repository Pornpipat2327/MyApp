/**
 * @file order-status-badge.tsx
 * @description ป้ายแสดงสถานะของคำสั่งซื้อ สไตล์ Minecraft Voxel Design System
 * 0px Voxel Doctrine, Tinted Background, และ Color Border
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { OrderStatus } from '@/types/order';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export const STATUS_CONFIG: Record<OrderStatus, { bg: string; text: string; label: string }> = {
  pending: { bg: 'rgba(255, 149, 0, 0.15)', text: '#FF9500', label: 'รอชำระเงิน (Pending)' },
  processing: { bg: 'rgba(0, 122, 255, 0.15)', text: '#007AFF', label: 'กำลังเตรียมจัดส่ง (Processing)' },
  shipped: { bg: 'rgba(175, 82, 222, 0.15)', text: '#AF52DE', label: 'จัดส่งแล้ว (In Transit)' },
  delivered: { bg: 'rgba(108, 195, 73, 0.15)', text: '#6cc349', label: 'จัดส่งสำเร็จ (Delivered)' },
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  return (
    <View style={[styles.badge, { backgroundColor: config.bg, borderColor: config.text }]}>
      <ThemedText style={[styles.badgeText, { color: config.text }]}>
        {config.label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 0, // 0px voxel doctrine
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
