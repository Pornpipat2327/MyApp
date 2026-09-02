/**
 * @file order-card.tsx
 * @description การ์ดแสดงรายละเอียดคำสั่งซื้อเดี่ยว พร้อมรายการสินค้า ข้อมูลการจัดส่ง และแผงเปลี่ยนสถานะสำหรับ Admin
 */

import React from 'react';
import { StyleSheet, View, Image, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Order, OrderStatus } from '@/types/order';
import { OrderStatusBadge } from './order-status-badge';
import { getImageSource } from '@/utils/image';

interface OrderCardProps {
  order: Order;
  isAdmin: boolean;
  onUpdateStatus?: (orderId: string, newStatus: OrderStatus) => void;
}

export function OrderCard({ order, isAdmin, onUpdateStatus }: OrderCardProps) {
  const theme = useTheme();

  const formattedDate = new Date(order.createdAt).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      {/* ส่วนหัว: รหัสออเดอร์ วันที่ และสถานะ */}
      <View style={styles.cardHeader}>
        <View>
          <ThemedText type="smallBold" style={{ color: '#6cc349', fontSize: 16 }}>
            #{order.id}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {formattedDate}
          </ThemedText>
        </View>
        <OrderStatusBadge status={order.status} />
      </View>

      {/* ข้อมูลผู้สั่งและเลขพัสดุ */}
      <View style={[styles.infoBar, { backgroundColor: theme.background }]}>
        <ThemedText type="small">
          👤 <ThemedText type="smallBold">{order.shippingAddress.recipientName}</ThemedText> ({order.username})
        </ThemedText>
        {order.trackingNumber && (
          <ThemedText type="small" themeColor="textSecondary">
            📦 พัสดุ: <ThemedText type="smallBold">{order.trackingNumber}</ThemedText>
          </ThemedText>
        )}
      </View>

      {/* รายการสินค้าที่สั่ง */}
      <View style={styles.itemsList}>
        {order.items.map((item, idx) => {
          const imgSrc = getImageSource(item.image);
          return (
            <View key={`${item.id}-${idx}`} style={styles.itemRow}>
              <View style={styles.thumbnailBox}>
                {imgSrc ? (
                  <Image source={imgSrc} style={styles.thumbnail} resizeMode="cover" />
                ) : (
                  <View style={[styles.thumbnail, { backgroundColor: theme.border }]} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText type="smallBold" numberOfLines={1}>
                  {item.name}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {item.category || 'General'} x {item.quantity}
                </ThemedText>
              </View>
              <ThemedText type="smallBold">
                ${(Number(item.price) * item.quantity).toFixed(2)}
              </ThemedText>
            </View>
          );
        })}
      </View>

      {/* สรุปที่อยู่และยอดเงินสุทธิ */}
      <View style={[styles.footerRow, { borderTopColor: theme.border }]}>
        <View style={{ flex: 1 }}>
          <ThemedText type="small" themeColor="textSecondary">
            ชำระผ่าน: {order.paymentMethod.toUpperCase()} ({order.paymentStatus})
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
            ส่งไปที่: {order.shippingAddress.city} {order.shippingAddress.postalCode}
          </ThemedText>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <ThemedText type="small" themeColor="textSecondary">
            ยอดรวมสุทธิ
          </ThemedText>
          <ThemedText type="smallBold" style={{ color: '#6cc349', fontSize: 18 }}>
            ${order.totalAmount.toFixed(2)}
          </ThemedText>
        </View>
      </View>

      {/* ส่วนควบคุมสถานะสำหรับผู้ดูแลระบบ (Admin Controls) */}
      {isAdmin && onUpdateStatus && (
        <View style={[styles.adminActions, { backgroundColor: theme.background }]}>
          <ThemedText type="smallBold" style={{ color: '#FF9500', fontSize: 12 }}>
            ⚡ อัปเดตสถานะ (Admin):
          </ThemedText>
          <View style={styles.statusButtonsRow}>
            {(['pending', 'processing', 'shipped', 'delivered'] as OrderStatus[]).map((st) => (
              <Pressable
                key={st}
                onPress={() => onUpdateStatus(order.id, st)}
                style={[
                  styles.statusBtn,
                  order.status === st && { backgroundColor: '#6cc349', borderColor: '#6cc349' },
                ]}
              >
                <ThemedText
                  type="small"
                  style={{
                    fontSize: 11,
                    color: order.status === st ? '#ffffff' : theme.text,
                    fontWeight: order.status === st ? '700' : '400',
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
    borderColor: 'rgba(128, 128, 128, 0.15)',
    gap: Spacing.three,
    borderRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoBar: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
    borderRadius: 4,
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
    borderRadius: 4,
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
    borderRadius: 6,
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
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.3)',
  },
});
