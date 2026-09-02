/**
 * @file order-card.tsx
 * @description การ์ดแสดงผลคำสั่งซื้อ สไตล์ Minecraft Voxel Design System
 * 0px Voxel Doctrine, Dark Border (#3d3938), Surface Mid Info Bar (#262423), และ Status Control Buttons (#3c8527)
 */

import React from 'react';
import { StyleSheet, View, Image, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Order, OrderStatus } from '@/types/order';
import { OrderStatusBadge } from '@/components/orders/order-status-badge';
import { getImageSource } from '@/utils/image';

interface OrderCardProps {
  order: Order;
  isAdmin: boolean;
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
}

export function OrderCard({ order, isAdmin, onUpdateStatus }: OrderCardProps) {
  const theme = useTheme();

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      {/* ส่วนหัวการ์ด: รหัสออเดอร์ และ สถานะ */}
      <View style={styles.cardHeader}>
        <View>
          <ThemedText type="smallBold" style={{ fontSize: 16 }}>
            {order.id}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={{ fontSize: 11 }}>
            {new Date(order.createdAt).toLocaleString('th-TH')}
          </ThemedText>
        </View>

        <OrderStatusBadge status={order.status} />
      </View>

      {/* แถบข้อมูลลูกค้าและที่อยู่จัดส่ง */}
      <View style={styles.infoBar}>
        <ThemedText type="small" themeColor="textSecondary" style={{ fontSize: 12 }}>
          👤 ผู้สั่งซื้อ: <ThemedText type="smallBold">{order.shippingAddress.recipientName}</ThemedText> (
          {order.username})
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={{ fontSize: 12 }}>
          📍 {order.shippingAddress.city} {order.shippingAddress.postalCode}
        </ThemedText>
      </View>

      {/* รายการสินค้าในออเดอร์ */}
      <View style={styles.itemsList}>
        {order.items.map((item, idx) => {
          const imgSrc = getImageSource(item.image);
          return (
            <View key={item.id ?? idx} style={styles.itemRow}>
              <View style={styles.thumbnailBox}>
                {imgSrc ? (
                  <Image source={imgSrc} style={styles.thumbnail} resizeMode="cover" />
                ) : (
                  <View style={[styles.thumbnail, { backgroundColor: theme.background }]} />
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

      {/* แถบสรุปราคาด้านล่าง */}
      <View style={[styles.footerRow, { borderTopColor: theme.border }]}>
        <View>
          <ThemedText type="small" themeColor="textSecondary" style={{ fontSize: 11 }}>
            ชำระด้วย: {order.paymentMethod.toUpperCase()} ({order.paymentStatus})
          </ThemedText>
          {order.trackingNumber ? (
            <ThemedText type="small" style={{ color: '#007AFF', fontSize: 11 }}>
              📦 Tracking: {order.trackingNumber}
            </ThemedText>
          ) : null}
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <ThemedText type="small" themeColor="textSecondary" style={{ fontSize: 11 }}>
            ยอดรวมทั้งหมด
          </ThemedText>
          <ThemedText type="subtitle" style={{ color: '#6cc349', fontSize: 18 }}>
            ${order.totalAmount.toFixed(2)}
          </ThemedText>
        </View>
      </View>

      {/* ส่วนควบคุมสถานะออเดอร์สำหรับ Admin */}
      {isAdmin && (
        <View style={styles.adminActions}>
          <ThemedText type="smallBold" style={{ fontSize: 11, color: '#d0c5c0', letterSpacing: 0.5, textTransform: 'uppercase' }}>
            เปลี่ยนสถานะพัสดุ (Admin Control):
          </ThemedText>
          <View style={styles.statusButtonsRow}>
            {(['pending', 'processing', 'shipped', 'delivered'] as OrderStatus[]).map((st) => (
              <Pressable
                key={st}
                onPress={() => onUpdateStatus(order.id, st)}
                style={[
                  styles.statusBtn,
                  order.status === st && { backgroundColor: '#3c8527', borderColor: '#6cc349' },
                ]}
              >
                <ThemedText
                  type="small"
                  style={{
                    fontSize: 11,
                    color: order.status === st ? '#ffffff' : theme.text,
                    fontWeight: order.status === st ? '800' : '400',
                  }}
                >
                  {st}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: '#3d3938',
    gap: Spacing.three,
    borderRadius: 0, // 0px voxel doctrine
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoBar: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
    borderRadius: 0, // 0px voxel doctrine
    backgroundColor: '#262423',
    borderWidth: 1,
    borderColor: '#3d3938',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  itemsList: {
    gap: Spacing.two,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  thumbnailBox: {
    width: 40,
    height: 40,
    borderRadius: 0, // 0px voxel doctrine
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: Spacing.two,
  },
  adminActions: {
    padding: Spacing.two,
    borderRadius: 0, // 0px voxel doctrine
    backgroundColor: '#262423',
    borderWidth: 1,
    borderColor: '#3d3938',
    gap: 6,
  },
  statusButtonsRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  statusBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 0, // 0px voxel doctrine
    borderWidth: 1,
    borderColor: '#3d3938',
    backgroundColor: '#1d1e1e',
  },
});
