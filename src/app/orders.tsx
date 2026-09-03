/**
 * @file orders.tsx
 * @description หน้าจอแสดงรายการคำสั่งซื้อทั้งหมด สไตล์ Minecraft Voxel Design System
 * 0px Voxel Doctrine, Admin Stats Banner with Green Stripe, Dark Border (#3d3938), และ Surface Mid Filter Section
 * รองรับทั้ง Admin (จัดการทุกออเดอร์/อัปเดตสถานะ) และ User ทั่วไป (ดูประวัติการสั่งซื้อของตนเอง)
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { TopHeader } from '@/components/top-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { Order, OrderStatus } from '@/types/order';
import { OrderFilters } from '@/components/orders/order-filters';
import { OrderCard } from '@/components/orders/order-card';
import { getStorageJSON, setStorageJSON, subscribeStorageChange, emitStorageChange } from '@/utils/storage';

const SEED_ORDERS: Order[] = [
  {
    id: 'EK-98214',
    username: 'admin',
    userRole: 'admin',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    status: 'shipped',
    items: [
      {
        id: 'seed-1',
        name: 'Extreme Pro Wireless Mechanical Keyboard',
        price: 149.99,
        quantity: 1,
        category: 'Wireless',
      },
    ],
    subtotal: 149.99,
    shippingFee: 0,
    discount: 0,
    totalAmount: 149.99,
    shippingAddress: {
      recipientName: 'Demo Customer',
      phone: '089-123-4567',
      address: '88/1 Sukhumvit Rd',
      city: 'Bangkok',
      postalCode: '10110',
    },
    paymentMethod: 'promptpay',
    paymentStatus: 'paid',
    trackingNumber: 'TH847291048TH',
  },
  {
    id: 'EK-47102',
    username: 'user',
    userRole: 'user',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    status: 'processing',
    items: [
      {
        id: 'seed-2',
        name: 'Retro Classic RGB Mechanical Keyboard',
        price: 89.00,
        quantity: 1,
        category: 'Vintage',
      },
    ],
    subtotal: 89.00,
    shippingFee: 10,
    discount: 0,
    totalAmount: 99.00,
    shippingAddress: {
      recipientName: 'User Member',
      phone: '081-987-6543',
      address: '123 Phahonyothin Rd',
      city: 'Bangkok',
      postalCode: '10400',
    },
    paymentMethod: 'bank_transfer',
    paymentStatus: 'paid',
    trackingNumber: 'TH592019482TH',
  },
];

export default function OrdersScreen() {
  const router = useRouter();

  // ดึงข้อมูลผู้ใช้ปัจจุบันแบบ Dynamic
  const [currentUser, setCurrentUser] = useState<any>(() => {
    return getStorageJSON('user', null);
  });

  useEffect(() => {
    const updateCurrentUser = () => {
      setCurrentUser(getStorageJSON('user', null));
    };
    return subscribeStorageChange('auth-change', updateCurrentUser);
  }, []);

  const isAdmin = useMemo(() => {
    return (currentUser?.role || '').toLowerCase() === 'admin';
  }, [currentUser]);

  // โหลดรายการคำสั่งซื้อจาก Universal Storage
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const stored = getStorageJSON<Order[]>('extreme_keys_orders', []);
      if (stored && stored.length > 0) {
        // หากใน storage มีแค่ออเดอร์ admin ตัวเดียว ให้รวม seed orders เข้าไปด้วยเพื่อให้ user เห็นออเดอร์
        const hasUserOrder = stored.some((o) => o.username !== 'admin');
        if (!hasUserOrder) {
          const merged = [...stored, SEED_ORDERS[1]];
          setStorageJSON('extreme_keys_orders', merged);
          return merged;
        }
        return stored;
      }
      setStorageJSON('extreme_keys_orders', SEED_ORDERS);
      return SEED_ORDERS;
    } catch {
      return SEED_ORDERS;
    }
  });

  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const syncOrders = useCallback(() => {
    try {
      const stored = getStorageJSON<Order[]>('extreme_keys_orders', []);
      if (stored) setOrders(stored);
    } catch {}
  }, []);

  useEffect(() => {
    return subscribeStorageChange('orders-change', syncOrders);
  }, [syncOrders]);

  const handleUpdateStatus = useCallback(
    (orderId: string, newStatus: OrderStatus) => {
      setOrders((prev) => {
        const updated = prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
        try {
          setStorageJSON('extreme_keys_orders', updated);
          emitStorageChange('orders-change');
        } catch {}
        return updated;
      });
    },
    []
  );

  const filterCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: orders.length,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
    };
    orders.forEach((o) => {
      if (counts[o.status] !== undefined) {
        counts[o.status]++;
      }
    });
    return counts;
  }, [orders]);

  const totalRevenue = useMemo(() => {
    return orders.reduce((sum, o) => sum + o.totalAmount, 0);
  }, [orders]);

  const pendingCount = useMemo(() => {
    return orders.filter((o) => o.status === 'pending').length;
  }, [orders]);

  // กรองคำสั่งซื้อ: Admin เห็นทั้งหมด, User เห็นของตนเอง + Guest + Seed
  const filteredOrders = useMemo(() => {
    let list = [...orders];

    if (!isAdmin) {
      const activeUsername = (currentUser?.username || '').toLowerCase().trim();
      list = list.filter((o) => {
        const orderUser = (o.username || '').toLowerCase().trim();
        return (
          (activeUsername && orderUser === activeUsername) ||
          orderUser === 'guest' ||
          orderUser === 'user' ||
          !orderUser
        );
      });
    }

    if (selectedFilter !== 'all') {
      list = list.filter((o) => o.status === selectedFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.username.toLowerCase().includes(q) ||
          o.shippingAddress.recipientName.toLowerCase().includes(q) ||
          (o.trackingNumber && o.trackingNumber.toLowerCase().includes(q))
      );
    }

    return list;
  }, [orders, isAdmin, currentUser, selectedFilter, searchQuery]);

  return (
    <ThemedView type="background" style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <TopHeader />

        {/* Header Bar */}
        <View style={styles.headerBar}>
          <Pressable
            onPress={() => router.push('/' as any)}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <SymbolView
              tintColor="#6cc349"
              name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' } as any}
              size={20}
            />
            <ThemedText type="smallBold">Back</ThemedText>
          </Pressable>
          <ThemedText type="smallBold" style={styles.headerTitle}>
            {isAdmin ? '👑 Customer Orders Management' : '📦 My Orders History'}
          </ThemedText>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentWrapper}>
            {/* Admin Stats Banner - Minecraft Voxel Banner with Green Left Stripe */}
            {isAdmin && (
              <ThemedView type="backgroundElement" style={styles.adminStatsBanner}>
                <View style={styles.adminStatItem}>
                  <ThemedText type="small" themeColor="textSecondary">
                    Total Orders
                  </ThemedText>
                  <ThemedText type="subtitle" style={{ color: '#007AFF', marginTop: 2 }}>
                    {orders.length}
                  </ThemedText>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.adminStatItem}>
                  <ThemedText type="small" themeColor="textSecondary">
                    Total Sales Revenue
                  </ThemedText>
                  <ThemedText type="subtitle" style={{ color: '#6cc349', marginTop: 2 }}>
                    ${totalRevenue.toFixed(2)}
                  </ThemedText>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.adminStatItem}>
                  <ThemedText type="small" themeColor="textSecondary">
                    Pending Orders
                  </ThemedText>
                  <ThemedText type="subtitle" style={{ color: '#ffc42b', marginTop: 2 }}>
                    {pendingCount}
                  </ThemedText>
                </View>
              </ThemedView>
            )}

            {/* Filter Section */}
            <OrderFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedFilter={selectedFilter}
              onSelectFilter={setSelectedFilter}
              counts={filterCounts}
            />

            {/* รายการคำสั่งซื้อ */}
            {filteredOrders.length === 0 ? (
              <ThemedView type="backgroundElement" style={styles.emptyCard}>
                <SymbolView
                  tintColor="#888888"
                  name={{
                    ios: 'doc.text.magnifyingglass',
                    android: 'search_off',
                    web: 'search_off',
                  }}
                  size={48}
                />
                <ThemedText type="smallBold" style={{ marginTop: 8 }}>
                  {isAdmin ? 'No Orders Found' : 'ยังไม่มีประวัติการสั่งซื้อ (No Orders Yet)'}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary" style={{ textAlign: 'center', marginTop: 4, maxWidth: 300 }}>
                  {isAdmin
                    ? 'No orders match your current filter criteria.'
                    : 'คุณยังไม่มีรายการสั่งซื้อ เริ่มต้นเลือกซื้อคีย์บอร์ดที่คุณชอบได้เลย!'}
                </ThemedText>
                {!isAdmin && (
                  <Pressable
                    onPress={() => router.push('/product')}
                    style={({ pressed }) => [
                      styles.shopNowBtn,
                      pressed && styles.pressed,
                    ]}
                  >
                    <ThemedText type="smallBold" style={{ color: '#ffffff' }}>
                      🛒 เลือกซื้อสินค้า (Explore Products)
                    </ThemedText>
                  </Pressable>
                )}
              </ThemedView>
            ) : (
              <View style={styles.ordersList}>
                {filteredOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    isAdmin={isAdmin}
                    onUpdateStatus={handleUpdateStatus}
                  />
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: '#3d3938',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerTitle: {
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.six,
  },
  contentWrapper: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.four,
  },
  adminStatsBanner: {
    flexDirection: 'row',
    padding: Spacing.four,
    borderRadius: 0, // 0px voxel doctrine
    borderWidth: 2,
    borderColor: '#3d3938',
    borderLeftWidth: 4,
    borderLeftColor: '#6cc349',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  adminStatItem: {
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#3d3938',
  },
  ordersList: {
    gap: Spacing.three,
  },
  emptyCard: {
    padding: Spacing.six,
    borderRadius: 0, // 0px voxel doctrine
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3d3938',
    gap: 6,
  },
  shopNowBtn: {
    backgroundColor: '#3c8527',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: 0,
    marginTop: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#262423',
  },
  pressed: {
    opacity: 0.7,
  },
});
