import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Pressable,
  Image,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { TopHeader } from '@/components/top-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Order } from './checkout';
import { getBaseUrl } from '@/constants/api';

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: 'rgba(255, 149, 0, 0.15)', text: '#FF9500', label: 'Pending Payment' },
  processing: { bg: 'rgba(0, 122, 255, 0.15)', text: '#007AFF', label: 'Processing' },
  shipped: { bg: 'rgba(175, 82, 222, 0.15)', text: '#AF52DE', label: 'Shipped (In Transit)' },
  delivered: { bg: 'rgba(52, 199, 89, 0.15)', text: '#34C759', label: 'Delivered' },
};

export default function OrdersScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample default initial order if none exists
  const loadOrders = () => {
    if (Platform.OS === 'web') {
      try {
        const userStr = localStorage.getItem('user');
        let userObj = null;
        if (userStr) {
          userObj = JSON.parse(userStr);
          setCurrentUser(userObj);
          setIsAdmin((userObj?.role || '').toLowerCase() === 'admin');
        }

        const ordersStr = localStorage.getItem('extreme_keys_orders');
        if (ordersStr) {
          setOrders(JSON.parse(ordersStr));
        } else {
          // Mock seed orders if completely empty
          const seedOrders: Order[] = [
            {
              id: 'EK-98214',
              username: userObj?.username || 'admin',
              userRole: userObj?.role || 'admin',
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
          setOrders(seedOrders);
          localStorage.setItem('extreme_keys_orders', JSON.stringify(seedOrders));
        }
      } catch (e) {
        console.error('Failed to load orders', e);
      }
    }
  };

  useEffect(() => {
    loadOrders();

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.addEventListener('orders-change', loadOrders);
      window.addEventListener('storage', loadOrders);
      return () => {
        window.removeEventListener('orders-change', loadOrders);
        window.removeEventListener('storage', loadOrders);
      };
    }
  }, []);

  const handleUpdateStatus = (orderId: string, newStatus: Order['status']) => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
    setOrders(updated);
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem('extreme_keys_orders', JSON.stringify(updated));
        window.dispatchEvent(new Event('orders-change'));
      } catch (e) {}
    }
  };

  const filteredOrders = useMemo(() => {
    let list = [...orders];

    // For non-admin users, only show their own orders (or guest orders)
    if (!isAdmin && currentUser?.username) {
      list = list.filter((o) => o.username === currentUser.username || !o.username || o.username === 'Guest');
    }

    // Filter by Status
    if (selectedFilter !== 'all') {
      list = list.filter((o) => o.status === selectedFilter);
    }

    // Filter by Search Query
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

  const getImageSource = (imagePath?: string) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
      return { uri: imagePath };
    }
    if (imagePath.startsWith('/uploads/') || imagePath.startsWith('/')) {
      return { uri: `${getBaseUrl()}${imagePath}` };
    }
    return null;
  };

  const totalRevenue = useMemo(() => {
    return orders.reduce((sum, o) => sum + o.totalAmount, 0);
  }, [orders]);

  const pendingCount = useMemo(() => {
    return orders.filter((o) => o.status === 'pending').length;
  }, [orders]);

  return (
    <ThemedView type="background" style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <TopHeader />

        {/* Header Bar */}
        <View style={[styles.headerBar, { borderBottomColor: 'rgba(128,128,128,0.15)' }]}>
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : router.push('/'))}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <SymbolView
              tintColor={theme.text}
              name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' } as any}
              size={20}
            />
            <ThemedText type="smallBold">Back</ThemedText>
          </Pressable>
          <ThemedText type="smallBold" style={styles.headerTitle}>
            {isAdmin ? '👑 Customer Orders Management' : 'My Orders History'}
          </ThemedText>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentWrapper}>
            {/* Admin Stats Banner */}
            {isAdmin && (
              <ThemedView type="backgroundElement" style={styles.adminStatsBanner}>
                <View style={styles.adminStatItem}>
                  <ThemedText type="small" themeColor="textSecondary">Total Orders</ThemedText>
                  <ThemedText type="subtitle" style={{ color: '#007AFF', marginTop: 2 }}>{orders.length}</ThemedText>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.adminStatItem}>
                  <ThemedText type="small" themeColor="textSecondary">Total Sales Revenue</ThemedText>
                  <ThemedText type="subtitle" style={{ color: '#34C759', marginTop: 2 }}>${totalRevenue.toFixed(2)}</ThemedText>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.adminStatItem}>
                  <ThemedText type="small" themeColor="textSecondary">Pending Orders</ThemedText>
                  <ThemedText type="subtitle" style={{ color: '#FF9500', marginTop: 2 }}>{pendingCount}</ThemedText>
                </View>
              </ThemedView>
            )}

            {/* Filter Tabs & Search Bar */}
            <View style={styles.filterSection}>
              {/* Search input for Admin */}
              {isAdmin && (
                <View style={[styles.searchBox, { backgroundColor: theme.backgroundElement }]}>
                  <SymbolView
                    tintColor={theme.textSecondary}
                    name={{ ios: 'magnifyingglass', android: 'search', web: 'search' } as any}
                    size={16}
                  />
                  <TextInput
                    placeholder="Search by Order ID, Customer, or Tracking..."
                    placeholderTextColor={theme.textSecondary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    style={[styles.searchInput, { color: theme.text }]}
                  />
                </View>
              )}

              {/* Status Filter Chips */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChipsScroll}>
                {['all', 'pending', 'processing', 'shipped', 'delivered'].map((st) => {
                  const isActive = selectedFilter === st;
                  return (
                    <Pressable
                      key={st}
                      onPress={() => setSelectedFilter(st)}
                      style={[
                        styles.filterChip,
                        { backgroundColor: isActive ? theme.text : theme.backgroundElement },
                      ]}
                    >
                      <ThemedText
                        type="smallBold"
                        style={{
                          color: isActive ? theme.background : theme.textSecondary,
                          textTransform: 'capitalize',
                        }}
                      >
                        {st}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <ThemedView type="backgroundElement" style={styles.emptyOrdersCard}>
                <SymbolView
                  tintColor={theme.textSecondary}
                  name={{ ios: 'doc.plaintext', android: 'receipt_long', web: 'receipt_long' } as any}
                  size={56}
                />
                <ThemedText type="subtitle" style={{ marginTop: Spacing.three }}>
                  No Orders Found
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary" style={{ textAlign: 'center', marginTop: Spacing.one }}>
                  {isAdmin
                    ? 'No customer orders match the current filter.'
                    : "You haven't placed any keyboard orders yet."}
                </ThemedText>
                <Pressable
                  onPress={() => router.push('/product')}
                  style={({ pressed }) => [styles.exploreBtn, pressed && styles.pressed]}
                >
                  <ThemedText type="smallBold" style={{ color: '#ffffff' }}>
                    Start Shopping
                  </ThemedText>
                </Pressable>
              </ThemedView>
            ) : (
              <View style={styles.ordersList}>
                {filteredOrders.map((order) => {
                  const statusInfo = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
                  const dateStr = new Date(order.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <ThemedView key={order.id} type="backgroundElement" style={styles.orderCard}>
                      {/* Top Row: Order ID, Date, Status Badge */}
                      <View style={styles.orderCardHeader}>
                        <View>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.two }}>
                            <ThemedText type="subtitle" style={styles.orderIdText}>
                              #{order.id}
                            </ThemedText>
                            {isAdmin && (
                              <View style={styles.customerRoleTag}>
                                <ThemedText type="small" style={{ fontSize: 11, color: '#007AFF', fontWeight: '700' }}>
                                  👤 {order.username} ({order.userRole || 'user'})
                                </ThemedText>
                              </View>
                            )}
                          </View>
                          <ThemedText type="small" themeColor="textSecondary" style={{ marginTop: 2, fontSize: 12 }}>
                            📅 {dateStr}
                          </ThemedText>
                        </View>

                        <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                          <ThemedText type="smallBold" style={{ color: statusInfo.text, fontSize: 12 }}>
                            {statusInfo.label}
                          </ThemedText>
                        </View>
                      </View>

                      {/* Divider */}
                      <View style={[styles.cardDivider, { backgroundColor: 'rgba(128,128,128,0.12)' }]} />

                      {/* Items in Order */}
                      <View style={styles.orderItemsList}>
                        {order.items.map((item, idx) => (
                          <View key={idx} style={styles.orderItemRow}>
                            <View style={styles.itemThumb}>
                              {getImageSource(item.image) ? (
                                <Image source={getImageSource(item.image)!} style={styles.itemImg} />
                              ) : (
                                <View style={styles.itemPlaceholder}>
                                  <SymbolView tintColor={theme.textSecondary} name={{ ios: 'keyboard', android: 'keyboard', web: 'keyboard' } as any} size={16} />
                                </View>
                              )}
                            </View>
                            <View style={{ flex: 1 }}>
                              <ThemedText type="smallBold" numberOfLines={1}>
                                {item.name}
                              </ThemedText>
                              <ThemedText type="small" themeColor="textSecondary" style={{ fontSize: 12 }}>
                                Qty: {item.quantity} × ${item.price.toFixed(2)}
                              </ThemedText>
                            </View>
                            <ThemedText type="smallBold" style={{ color: '#007AFF' }}>
                              ${(item.price * item.quantity).toFixed(2)}
                            </ThemedText>
                          </View>
                        ))}
                      </View>

                      {/* Shipping Info & Tracking */}
                      <View style={[styles.shippingDetailsBox, { backgroundColor: theme.background }]}>
                        <View style={styles.detailLine}>
                          <ThemedText type="small" themeColor="textSecondary">📍 Shipping To:</ThemedText>
                          <ThemedText type="small" style={{ flex: 1, textAlign: 'right' }} numberOfLines={2}>
                            {order.shippingAddress.recipientName} ({order.shippingAddress.phone}), {order.shippingAddress.address}, {order.shippingAddress.city} {order.shippingAddress.postalCode}
                          </ThemedText>
                        </View>
                        <View style={styles.detailLine}>
                          <ThemedText type="small" themeColor="textSecondary">🚚 Tracking No:</ThemedText>
                          <ThemedText type="smallBold" style={{ color: '#AF52DE' }}>
                            {order.trackingNumber || 'Pending Courier Dispatch'}
                          </ThemedText>
                        </View>
                        <View style={styles.detailLine}>
                          <ThemedText type="small" themeColor="textSecondary">💳 Payment:</ThemedText>
                          <ThemedText type="smallBold" style={{ textTransform: 'uppercase' }}>
                            {order.paymentMethod} ({order.paymentStatus})
                          </ThemedText>
                        </View>
                      </View>

                      {/* Total Amount Row */}
                      <View style={styles.orderFooterRow}>
                        <ThemedText type="small" themeColor="textSecondary">
                          Total Paid ({order.items.reduce((s, i) => s + i.quantity, 0)} items)
                        </ThemedText>
                        <ThemedText type="subtitle" style={styles.totalPriceText}>
                          ${order.totalAmount.toFixed(2)}
                        </ThemedText>
                      </View>

                      {/* Admin Management Status Controls */}
                      {isAdmin && (
                        <View style={styles.adminControlsSection}>
                          <ThemedText type="smallBold" style={{ fontSize: 12, color: '#FF9500', marginBottom: 6 }}>
                            ⚡ Admin Status Actions:
                          </ThemedText>
                          <View style={styles.statusButtonsRow}>
                            <Pressable
                              onPress={() => handleUpdateStatus(order.id, 'processing')}
                              style={[
                                styles.statusActionBtn,
                                { backgroundColor: order.status === 'processing' ? '#007AFF' : theme.background },
                              ]}
                            >
                              <ThemedText type="smallBold" style={{ fontSize: 11, color: order.status === 'processing' ? '#fff' : theme.text }}>
                                Process
                              </ThemedText>
                            </Pressable>

                            <Pressable
                              onPress={() => handleUpdateStatus(order.id, 'shipped')}
                              style={[
                                styles.statusActionBtn,
                                { backgroundColor: order.status === 'shipped' ? '#AF52DE' : theme.background },
                              ]}
                            >
                              <ThemedText type="smallBold" style={{ fontSize: 11, color: order.status === 'shipped' ? '#fff' : theme.text }}>
                                Ship 🚚
                              </ThemedText>
                            </Pressable>

                            <Pressable
                              onPress={() => handleUpdateStatus(order.id, 'delivered')}
                              style={[
                                styles.statusActionBtn,
                                { backgroundColor: order.status === 'delivered' ? '#34C759' : theme.background },
                              ]}
                            >
                              <ThemedText type="smallBold" style={{ fontSize: 11, color: order.status === 'delivered' ? '#fff' : theme.text }}>
                                Deliver ✓
                              </ThemedText>
                            </Pressable>
                          </View>
                        </View>
                      )}
                    </ThemedView>
                  );
                })}
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
    paddingVertical: Spacing.two,
    borderBottomWidth: 2,
    borderBottomColor: '#3d3938',
    backgroundColor: '#313131',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 60,
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
    borderRadius: 0,
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
  filterSection: {
    gap: Spacing.two,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#3d3938',
    backgroundColor: '#262423',
    gap: Spacing.two,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#ede5e2',
    ...Platform.select({
      web: {
        outlineStyle: 'none' as any,
        fontFamily: 'var(--font-sans)',
      },
    }),
  },
  filterChipsScroll: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#3d3938',
    marginRight: Spacing.two,
  },
  ordersList: {
    gap: Spacing.four,
  },
  orderCard: {
    padding: Spacing.four,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#3d3938',
    gap: Spacing.three,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderIdText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#6cc349',             // vanilla-green-3 order ID
  },
  customerRoleTag: {
    backgroundColor: 'rgba(108,195,73,0.12)',
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#6cc349',
  },
  statusBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: 0,
  },
  cardDivider: {
    height: 1,
    width: '100%',
    backgroundColor: '#3d3938',
  },
  orderItemsList: {
    gap: Spacing.two,
  },
  orderItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  itemThumb: {
    width: 44,
    height: 44,
    borderRadius: 0,
    overflow: 'hidden',
  },
  itemImg: {
    width: '100%',
    height: '100%',
  },
  itemPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1d1e1e',
  },
  shippingDetailsBox: {
    padding: Spacing.three,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#3d3938',
    gap: Spacing.one,
  },
  detailLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  orderFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.one,
  },
  totalPriceText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#6cc349',             // vanilla-green-3 total
  },
  adminControlsSection: {
    borderTopWidth: 1,
    borderTopColor: '#3d3938',
    paddingTop: Spacing.two,
  },
  statusButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  statusActionBtn: {
    flex: 1,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#3d3938',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyOrdersCard: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.six,
    paddingHorizontal: Spacing.four,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#3d3938',
    marginTop: Spacing.four,
  },
  exploreBtn: {
    marginTop: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: 0,
    backgroundColor: '#3c8527',
    borderWidth: 2,
    borderColor: '#262423',
  },
  pressed: {
    opacity: 0.75,
  },
});
