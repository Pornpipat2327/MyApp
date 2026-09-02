/**
 * @file orders.tsx
 * @description หน้าจอแสดงรายการคำสั่งซื้อทั้งหมด (Orders History Screen)
 * รองรับการค้นหา, การกรองตามสถานะ (รอชำระ, เตรียมจัดส่ง, จัดส่งแล้ว, สำเร็จ)
 * และระบบเปลี่ยนสถานะพัสดุสำหรับผู้ดูแลระบบ (Admin Controls)
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Pressable,
  Platform,
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
import { getStorageJSON, setStorageJSON } from '@/utils/storage';

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
];

export default function OrdersScreen() {
  const router = useRouter();

  // ดึงข้อมูลผู้ใช้ปัจจุบันแบบ Lazy Initializer
  const [currentUser] = useState<any>(() => {
    return getStorageJSON('user', null);
  });

  const isAdmin = useMemo(() => {
    return (currentUser?.role || '').toLowerCase() === 'admin';
  }, [currentUser]);

  // โหลดรายการคำสั่งซื้อจาก LocalStorage แบบ Lazy Initializer เพื่อขจัด cascading setState
  const [orders, setOrders] = useState<Order[]>(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        const stored = getStorageJSON<Order[]>('extreme_keys_orders', []);
        if (stored && stored.length > 0) return stored;
        // หากยังไม่มีเลย ให้บันทึก Seed เริ่มต้น
        setStorageJSON('extreme_keys_orders', SEED_ORDERS);
        return SEED_ORDERS;
      } catch (e) {
        console.error('Failed to init orders', e);
      }
    }
    return SEED_ORDERS;
  });

  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // ฟังก์ชันซิงค์ข้อมูลเมื่อมี Event orders-change หรือ storage
  const syncOrders = useCallback(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        const stored = getStorageJSON<Order[]>('extreme_keys_orders', []);
        if (stored) setOrders(stored);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.addEventListener('orders-change', syncOrders);
      window.addEventListener('storage', syncOrders);
      return () => {
        window.removeEventListener('orders-change', syncOrders);
        window.removeEventListener('storage', syncOrders);
      };
    }
  }, [syncOrders]);

  /**
   * อัปเดตสถานะคำสั่งซื้อ (เฉพาะ Admin)
   */
  const handleUpdateStatus = useCallback(
    (orderId: string, newStatus: OrderStatus) => {
      setOrders((prev) => {
        const updated = prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          try {
            setStorageJSON('extreme_keys_orders', updated);
            window.dispatchEvent(new Event('orders-change'));
          } catch {}
        }
        return updated;
      });
    },
    []
  );

  // คำนวณจำนวนออเดอร์ในแต่ละสถานะ
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

  // กรองคำสั่งซื้อตามตัวกรองและข้อความค้นหา
  const filteredOrders = useMemo(() => {
    let list = [...orders];

    // ถ้าไม่ใช่ Admin ให้แสดงเฉพาะคำสั่งซื้อของตัวเอง
    if (!isAdmin && currentUser?.username) {
      list = list.filter(
        (o) => o.username === currentUser.username || !o.username || o.username === 'Guest'
      );
    }

    // กรองตามแท็บสถานะ
    if (selectedFilter !== 'all') {
      list = list.filter((o) => o.status === selectedFilter);
    }

    // กรองตามคำค้นหา
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
            <ThemedText type="smallBold">หน้าแรก</ThemedText>
          </Pressable>
          <ThemedText type="smallBold" style={styles.headerTitle}>
            รายการคำสั่งซื้อ (Order History)
          </ThemedText>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ตัวกรองและช่องค้นหา */}
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
                name={{ ios: 'doc.text.magnifyingglass', android: 'search_off', web: 'search_off' } as any}
                size={48}
              />
              <ThemedText type="smallBold" style={{ marginTop: 8 }}>
                ไม่พบรายการคำสั่งซื้อ
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                ยังไม่มีคำสั่งซื้อที่ตรงกับเงื่อนไขการค้นหาของคุณ
              </ThemedText>
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
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.15)',
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
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
    padding: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.six,
    gap: Spacing.three,
  },
  ordersList: {
    gap: Spacing.three,
  },
  emptyCard: {
    padding: Spacing.six,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.15)',
    gap: 6,
  },
  pressed: {
    opacity: 0.7,
  },
});
