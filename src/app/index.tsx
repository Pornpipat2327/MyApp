import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TopHeader } from '@/components/top-header';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { Image, Platform, Pressable, ScrollView, StyleSheet, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getProductsApiUrl, getBaseUrl } from '@/constants/api';

const QUICK_ACTIONS = [
  { id: 'qa1', label: 'Add Product', icon: { ios: 'plus.circle.fill', android: 'add_circle', web: 'add_circle' } as const, color: '#007AFF', route: '/add' as const },
  { id: 'qa2', label: 'View Products', icon: { ios: 'list.bullet.rectangle.fill', android: 'inventory_2', web: 'inventory_2' } as const, color: '#30D158', route: '/product' as const },
  { id: 'qa4', label: 'Categories', icon: { ios: 'square.grid.2x2.fill', android: 'grid_view', web: 'grid_view' } as const, color: '#FF453A', route: '/categories' as const },
];

function SectionHeader({ title, actionText, onPress }: { title: string; actionText?: string; onPress?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <ThemedText type="smallBold" style={styles.sectionTitle}>{title}</ThemedText>
      {actionText && (
        <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
          <ThemedText type="small" style={styles.sectionLink}>{actionText}</ThemedText>
        </Pressable>
      )}
    </View>
  );
}

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = () => {
      let savedUser = null;
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        savedUser = localStorage.getItem('user');
      }
      if (!savedUser) {
        router.replace('/login' as any);
      } else {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          setIsAdmin(parsedUser?.role === 'admin');
        } catch (e) {
          router.replace('/login' as any);
        }
      }
    };

    checkUser();

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.addEventListener('storage', checkUser);
      window.addEventListener('auth-change', checkUser);
    }
    
    // Fetch API Data
    fetch(getProductsApiUrl())
      .then(res => res.json())
      .then(json => {
        const rawData = Array.isArray(json) ? json : json.data || [];
        setProducts(rawData);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));

    return () => {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.removeEventListener('storage', checkUser);
        window.removeEventListener('auth-change', checkUser);
      }
    };
  }, []);

  const totalProducts = products.length;
  // Get 5 most recent products
  const recentProducts = [...products].reverse().slice(0, 5);

  const getImageSource = (imagePath?: string) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
      return { uri: imagePath };
    }
    // รองรับ /uploads/ path จาก server
    if (imagePath.startsWith('/uploads/') || imagePath.startsWith('/')) {
      return { uri: `${getBaseUrl()}${imagePath}` };
    }
    return null;
  };

  return (
    <ThemedView type="background" style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.safe}>
        <TopHeader />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollInner}
          showsVerticalScrollIndicator={false}
        >
          {/* Welcome */}
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
                  name={{ ios: 'person.crop.circle.fill', android: 'account_circle', web: 'account_circle' }}
                  size={44}
                />
              </Pressable>
            </View>
          </View>

          {/* Stats */}
          <View style={[styles.content, styles.statsGrid]}>
             <ThemedView type="backgroundElement" style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: '#007AFF18' }]}>
                  <SymbolView tintColor="#007AFF" name={{ ios: 'shippingbox.fill', android: 'inventory_2', web: 'inventory_2' }} size={16} />
                </View>
                <ThemedText type="small" themeColor="textSecondary" style={styles.statLabel}>Total Products</ThemedText>
                {loading ? (
                    <ActivityIndicator size="small" color="#007AFF" style={{ alignSelf: 'flex-start', marginVertical: 4 }} />
                ) : (
                    <ThemedText type="subtitle" style={styles.statValue}>{totalProducts}</ThemedText>
                )}
              </ThemedView>
          </View>

          {/* Quick Actions */}
          <SectionHeader title="Quick Actions" />
          <View style={[styles.content, styles.actionsRow]}>
            {QUICK_ACTIONS.filter((a) => isAdmin || a.id !== 'qa1').map((a) => (
              <Pressable
                key={a.id}
                onPress={() => router.push(a.route as any)}
                style={({ pressed }) => [styles.actionCard, pressed && styles.pressed]}
              >
                <ThemedView type="backgroundElement" style={styles.actionInner}>
                  <View style={[styles.actionIcon, { backgroundColor: a.color + '18' }]}>
                    <SymbolView tintColor={a.color} name={a.icon} size={20} />
                  </View>
                  <ThemedText type="small" style={styles.actionLabel}>{a.label}</ThemedText>
                </ThemedView>
              </Pressable>
            ))}
          </View>

          {/* Recent Products (From API) */}
          <SectionHeader title="Recent Products" actionText="See All" onPress={() => router.push('/product')} />
          <View style={styles.content}>
            <ThemedView type="backgroundElement" style={styles.card}>
              {loading ? (
                  <View style={{ padding: 20, alignItems: 'center' }}>
                      <ActivityIndicator size="small" color={theme.text} />
                  </View>
              ) : recentProducts.length === 0 ? (
                  <View style={{ padding: 20, alignItems: 'center' }}>
                      <ThemedText type="small" themeColor="textSecondary">No products found</ThemedText>
                  </View>
              ) : (
                  recentProducts.map((p, i) => {
                    const imgSrc = getImageSource(p.image || p.Image || p.image_url);
                    return (
                      <Pressable
                        key={p.id || p.Product_ID || i}
                        onPress={() => router.push({ pathname: '/detail' as any, params: { id: String(p.id || p.Product_ID) } })}
                        style={({ pressed }) => pressed && { opacity: 0.8 }}
                      >
                        <View style={styles.productRow}>
                          {imgSrc ? (
                            <Image source={imgSrc} style={styles.productThumb} resizeMode="cover" />
                          ) : (
                            <View style={[styles.productThumb, { backgroundColor: theme.backgroundSelected, alignItems: 'center', justifyContent: 'center' }]}>
                              <SymbolView name={{ ios: 'keyboard', android: 'keyboard', web: 'keyboard' }} tintColor={theme.textSecondary} size={20} />
                            </View>
                          )}
                          <View style={styles.productInfo}>
                            <ThemedText type="smallBold" numberOfLines={1}>{p.name || p.Name}</ThemedText>
                            <ThemedText type="small" themeColor="textSecondary" style={styles.productSold}>{p.category || p.Category || 'General'}</ThemedText>
                          </View>
                          <ThemedText type="smallBold" style={styles.productRev}>${Number(p.price || p.Price || 0).toFixed(2)}</ThemedText>
                        </View>
                        {i < recentProducts.length - 1 && <View style={[styles.divider, { backgroundColor: theme.backgroundSelected }]} />}
                      </Pressable>
                    );
                  })
              )}
            </ThemedView>
          </View>

        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: { flex: 1 },
  scrollInner: {
    paddingBottom: BottomTabInset + Spacing.four,
  },
  pressed: { opacity: 0.75 },

  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
  },

  sectionHeader: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    marginTop: Spacing.five,
    marginBottom: Spacing.three,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700' },
  sectionLink: { fontWeight: '600', color: '#007AFF', fontSize: 13 },

  card: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
  },

  welcomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.four,
    paddingBottom: Spacing.one,
  },
  welcomeText: { flex: 1, gap: Spacing.one },
  welcomeTitle: { fontSize: 24, fontWeight: '800', lineHeight: 30 },
  welcomeSub: { fontSize: 13, marginTop: 2 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginTop: Spacing.four,
  },
  statCard: {
    flexBasis: '48%',
    flexGrow: 1,
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: 3,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  statLabel: { fontSize: 11, letterSpacing: 0.2 },
  statValue: { fontSize: 22, fontWeight: '800', lineHeight: 26 },

  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  actionCard: { flex: 1 },
  actionInner: {
    alignItems: 'center',
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    gap: Spacing.two,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center' },

  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
  productThumb: { width: 44, height: 44, borderRadius: Spacing.two },
  productInfo: { flex: 1, gap: 1 },
  productSold: { fontSize: 11 },
  productRev: { fontSize: 13, color: '#30D158' },

  divider: { height: 1, marginVertical: 2 },
});
