/**
 * @file index.tsx
 * @description หน้าหลักของแอปพลิเคชัน (Home Screen)
 * ประกอบด้วยส่วนต้อนรับผู้ใช้, เมนูลัด (Quick Actions), การ์ดสถิติต่างๆ และรายการสินค้ามาใหม่ล่าสุด
 */

import React, { useEffect, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TopHeader } from '@/components/top-header';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getProductsApiUrl } from '@/constants/api';
import { Product } from '@/types/product';
import { getImageSource } from '@/utils/image';
import { getStorageJSON } from '@/utils/storage';

const QUICK_ACTIONS = [
  { id: 'qa1', label: 'เพิ่มสินค้า', icon: { ios: 'plus.circle.fill', android: 'add_circle', web: 'add_circle' } as const, color: '#007AFF', route: '/add' as const },
  { id: 'qa2', label: 'ดูสินค้า', icon: { ios: 'list.bullet.rectangle.fill', android: 'inventory_2', web: 'inventory_2' } as const, color: '#30D158', route: '/product' as const },
  { id: 'qa3', label: 'ตะกร้า', icon: { ios: 'cart.fill', android: 'shopping_cart', web: 'shopping_cart' } as const, color: '#FF9500', route: '/cart' as const },
  { id: 'qa4', label: 'คำสั่งซื้อ', icon: { ios: 'doc.plaintext.fill', android: 'receipt_long', web: 'receipt_long' } as const, color: '#AF52DE', route: '/orders' as const },
  { id: 'qa5', label: 'หมวดหมู่', icon: { ios: 'square.grid.2x2.fill', android: 'grid_view', web: 'grid_view' } as const, color: '#FF453A', route: '/categories' as const },
];

function SectionHeader({
  title,
  actionText,
  onPress,
}: {
  title: string;
  actionText?: string;
  onPress?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <ThemedText type="smallBold" style={styles.sectionTitle}>
        {title}
      </ThemedText>
      {actionText && (
        <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
          <ThemedText type="small" style={styles.sectionLink}>
            {actionText}
          </ThemedText>
        </Pressable>
      )}
    </View>
  );
}

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();

  // ดึงข้อมูลผู้ใช้ปัจจุบันแบบ Lazy Initializer
  const [user, setUser] = useState<any>(() => {
    return getStorageJSON('user', null);
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    const u = getStorageJSON<{ role?: string }>('user', {});
    return u?.role === 'admin';
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = () => {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const savedUser = localStorage.getItem('user');
        if (!savedUser) {
          router.replace('/login' as any);
        } else {
          try {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            setIsAdmin(parsedUser?.role === 'admin');
          } catch {
            router.replace('/login' as any);
          }
        }
      }
    };

    checkUser();

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.addEventListener('storage', checkUser);
      window.addEventListener('auth-change', checkUser);
    }

    // ดึงข้อมูลสินค้าจาก REST API
    fetch(getProductsApiUrl())
      .then((res) => res.json())
      .then((json) => {
        const rawData = Array.isArray(json) ? json : json.data || [];
        setProducts(rawData);
      })
      .catch((err) => console.error('Fetch products error:', err))
      .finally(() => setLoading(false));

    return () => {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.removeEventListener('storage', checkUser);
        window.removeEventListener('auth-change', checkUser);
      }
    };
  }, [router]);

  const totalProducts = products.length;
  const recentProducts = [...products].reverse().slice(0, 5);

  return (
    <ThemedView type="background" style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.safe}>
        <TopHeader />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollInner}
          showsVerticalScrollIndicator={false}
        >
          {/* ส่วนต้อนรับผู้ใช้ */}
          <View style={styles.content}>
            <View style={styles.welcomeRow}>
              <View style={styles.welcomeText}>
                <ThemedText type="small" themeColor="textSecondary">
                  สวัสดี, {user?.username || 'User'} 👋
                </ThemedText>
                <ThemedText type="subtitle" style={styles.welcomeTitle}>
                  ยินดีต้อนรับสู่{'\n'}ExtremeKey
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary" style={styles.welcomeSub}>
                  จัดการร้านค้าคีย์บอร์ดของคุณได้จากที่นี่
                </ThemedText>
              </View>
              <Pressable
                onPress={() => router.push('/login' as any)}
                style={({ pressed }) => [
                  styles.avatar,
                  { backgroundColor: theme.backgroundElement },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <SymbolView
                  tintColor={theme.textSecondary}
                  name={{
                    ios: 'person.crop.circle.fill',
                    android: 'account_circle',
                    web: 'account_circle',
                  }}
                  size={44}
                />
              </Pressable>
            </View>

            {/* การ์ดสถิติ (Statistics Cards) */}
            <View style={styles.statsRow}>
              <ThemedView type="backgroundElement" style={styles.statCard}>
                <ThemedText type="subtitle" style={{ color: '#6cc349', fontSize: 24 }}>
                  {loading ? '-' : totalProducts}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  สินค้าทั้งหมด
                </ThemedText>
              </ThemedView>

              <ThemedView type="backgroundElement" style={styles.statCard}>
                <ThemedText type="subtitle" style={{ color: '#007AFF', fontSize: 24 }}>
                  6
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  หมวดหมู่หลัก
                </ThemedText>
              </ThemedView>

              <ThemedView type="backgroundElement" style={styles.statCard}>
                <ThemedText type="subtitle" style={{ color: '#FF9500', fontSize: 24 }}>
                  {isAdmin ? 'Admin' : 'User'}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  สิทธิ์ปัจจุบัน
                </ThemedText>
              </ThemedView>
            </View>

            {/* เมนูลัด (Quick Actions) */}
            <SectionHeader title="เมนูจัดการด่วน (Quick Actions)" />
            <View style={styles.quickActionsGrid}>
              {QUICK_ACTIONS.filter((qa) => qa.id !== 'qa1' || isAdmin).map((qa) => (
                <Pressable
                  key={qa.id}
                  onPress={() => router.push(qa.route as any)}
                  style={({ pressed }) => [styles.quickActionItem, pressed && styles.pressed]}
                >
                  <View style={[styles.qaIconCircle, { backgroundColor: qa.color }]}>
                    <SymbolView
                      tintColor="#ffffff"
                      name={qa.icon as any}
                      size={22}
                    />
                  </View>
                  <ThemedText type="smallBold" style={{ fontSize: 12 }}>
                    {qa.label}
                  </ThemedText>
                </Pressable>
              ))}
            </View>

            {/* สินค้ามาใหม่ล่าสุด */}
            <SectionHeader
              title="สินค้ามาใหม่ (Latest Products)"
              actionText="ดูทั้งหมด →"
              onPress={() => router.push('/product')}
            />

            {loading ? (
              <ActivityIndicator color="#6cc349" style={{ marginVertical: Spacing.four }} />
            ) : recentProducts.length === 0 ? (
              <ThemedView type="backgroundElement" style={styles.emptyProducts}>
                <ThemedText type="small" themeColor="textSecondary">
                  ยังไม่มีรายการสินค้าในระบบ
                </ThemedText>
              </ThemedView>
            ) : (
              <View style={styles.recentList}>
                {recentProducts.map((p) => {
                  const imgSrc = getImageSource(p.image);
                  return (
                    <Pressable
                      key={p.id}
                      onPress={() =>
                        router.push({
                          pathname: '/detail' as any,
                          params: { id: String(p.id) },
                        })
                      }
                      style={({ pressed }) => [
                        styles.recentItemRow,
                        { borderBottomColor: theme.border },
                        pressed && styles.pressed,
                      ]}
                    >
                      <View style={styles.recentThumbBox}>
                        {imgSrc ? (
                          <Image source={imgSrc} style={styles.recentThumb} resizeMode="cover" />
                        ) : (
                          <View style={[styles.recentThumb, { backgroundColor: theme.border }]} />
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <ThemedText type="smallBold" numberOfLines={1}>
                          {p.name}
                        </ThemedText>
                        <ThemedText type="small" themeColor="textSecondary">
                          {p.category || 'General'}
                        </ThemedText>
                      </View>
                      <ThemedText type="smallBold" style={{ color: '#6cc349' }}>
                        ${Number(p.price).toFixed(2)}
                      </ThemedText>
                    </Pressable>
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
  root: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollInner: {
    paddingBottom: BottomTabInset + Spacing.six,
    alignItems: 'center',
  },
  content: {
    maxWidth: MaxContentWidth,
    width: '100%',
    padding: Spacing.four,
    gap: Spacing.four,
  },
  welcomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    gap: 2,
  },
  welcomeTitle: {
    fontSize: 22,
    lineHeight: 28,
  },
  welcomeSub: {
    fontSize: 13,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  statCard: {
    flex: 1,
    padding: Spacing.three,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.15)',
    alignItems: 'center',
    gap: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  sectionTitle: {
    fontSize: 15,
  },
  sectionLink: {
    color: '#007AFF',
    fontSize: 13,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  quickActionItem: {
    alignItems: 'center',
    gap: 6,
    width: 70,
  },
  qaIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyProducts: {
    padding: Spacing.four,
    borderRadius: 8,
    alignItems: 'center',
  },
  recentList: {
    gap: 2,
  },
  recentItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: 8,
    borderBottomWidth: 0.5,
  },
  recentThumbBox: {
    width: 40,
    height: 40,
    borderRadius: 4,
    overflow: 'hidden',
  },
  recentThumb: {
    width: '100%',
    height: '100%',
  },
  pressed: {
    opacity: 0.7,
  },
});
