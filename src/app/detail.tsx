import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getProductsApiUrl } from '@/constants/api';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { SymbolView } from 'expo-symbols';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ProductDetail {
  id: string | number;
  name: string;
  category?: string;
  price: string | number;
  rating?: string | number;
  description?: string;
  image?: string;
  stock?: string | number;
  location_text?: string;
}

export default function ProductDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        router.replace('/login' as any);
        return;
      }
      try {
        const userObj = JSON.parse(userStr);
        setIsAdmin(userObj?.role === 'admin');
      } catch {
        setIsAdmin(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!params.id) {
      setError('No product ID provided.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`${getProductsApiUrl()}/${params.id}`)
      .then((res) => res.json())
      .then((resData) => {
        const d = resData?.data ?? resData;
        if (!d || (!d.id && !d.Product_ID && !d.name && !d.Name)) {
          throw new Error('Product not found');
        }
        setProduct({
          id: d.Product_ID ?? d.id ?? params.id!,
          name: d.Name ?? d.name ?? '',
          category: d.Category ?? d.category ?? 'General',
          price: d.Price ?? d.price ?? 0,
          rating: d.Rating ?? d.rating ?? 4.5,
          description: d.Description ?? d.description ?? '',
          image: d.image ?? d.Image ?? d.image_url ?? '',
          stock: d.Stock ?? d.stock ?? 0,
          location_text: d.Location ?? d.location ?? d.location_text ?? '',
        });
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load product');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [params.id]);

  const handleDelete = async () => {
    if (!product) return;

    const doDelete = async () => {
      try {
        const res = await fetch(`${getProductsApiUrl()}/${product.id}`, {
          method: 'DELETE',
        });
        const data = await res.json();
        if (res.ok && data.success) {
          if (Platform.OS === 'web') {
            window.alert(`Deleted "${product.name}" successfully.`);
          } else {
            Alert.alert('Deleted', `"${product.name}" has been removed.`);
          }
          router.back();
        } else {
          const msg = data.message || 'Failed to delete';
          if (Platform.OS === 'web') window.alert(msg);
          else Alert.alert('Error', msg);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Network error';
        if (Platform.OS === 'web') window.alert(msg);
        else Alert.alert('Error', msg);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Delete "${product.name}"?`)) doDelete();
    } else {
      Alert.alert('Confirm Delete', `Delete "${product.name}"?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  const formatPrice = (price: string | number) => {
    if (typeof price === 'number') return `$${price.toFixed(2)}`;
    if (!price) return '$0.00';
    return String(price).startsWith('$') ? String(price) : `$${price}`;
  };

  const getImageSource = (imagePath?: string) => {
    if (
      imagePath &&
      (imagePath.startsWith('http://') ||
        imagePath.startsWith('https://') ||
        imagePath.startsWith('data:'))
    ) {
      return { uri: imagePath };
    }
    return null;
  };

  const renderStars = (rating: string | number) => {
    const r = parseFloat(String(rating));
    const full = Math.floor(r);
    const empty = 5 - full;
    return '★'.repeat(full) + '☆'.repeat(empty);
  };

  return (
    <ThemedView type="background" style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        {/* Nav Bar */}
        <View style={[styles.navBar, { borderBottomColor: 'rgba(128,128,128,0.15)' }]}>
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : router.push('/product' as any))}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <SymbolView
              tintColor={theme.text}
              name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' } as any}
              size={20}
            />
            <ThemedText type="smallBold" style={styles.backText}>
              Back
            </ThemedText>
          </Pressable>

          <ThemedText type="smallBold" style={styles.navTitle} numberOfLines={1}>
            Product Detail
          </ThemedText>

          <View style={{ width: 72 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Loading */}
          {loading && (
            <View style={styles.centerState}>
              <ActivityIndicator size="large" color={theme.text} />
              <ThemedText type="small" themeColor="textSecondary" style={{ marginTop: Spacing.two }}>
                Loading details...
              </ThemedText>
            </View>
          )}

          {/* Error */}
          {error && !loading && (
            <View style={styles.centerState}>
              <SymbolView
                tintColor="#FF3B30"
                name={{ ios: 'exclamationmark.triangle', android: 'error', web: 'error' } as any}
                size={48}
              />
              <ThemedText type="small" style={{ color: '#FF3B30', marginTop: Spacing.two, textAlign: 'center' }}>
                {error}
              </ThemedText>
              <Pressable
                onPress={() => router.back()}
                style={({ pressed }) => [styles.actionBtn, { backgroundColor: '#007AFF' }, pressed && styles.pressed]}
              >
                <ThemedText type="smallBold" style={styles.actionBtnText}>
                  Go Back
                </ThemedText>
              </Pressable>
            </View>
          )}

          {/* Detail Content */}
          {!loading && !error && product && (
            <View style={styles.detailWrapper}>
              {/* Hero Image */}
              {getImageSource(product.image) ? (
                <Image
                  source={getImageSource(product.image)!}
                  style={styles.heroImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.heroImage, styles.heroPlaceholder, { backgroundColor: theme.backgroundElement }]}>
                  <SymbolView
                    name={{ ios: 'keyboard', android: 'keyboard', web: 'keyboard' } as any}
                    tintColor={theme.textSecondary}
                    size={80}
                  />
                </View>
              )}

              {/* Info Card */}
              <ThemedView type="backgroundElement" style={styles.infoCard}>
                {/* Category & Rating */}
                <View style={styles.metaRow}>
                  <View style={[styles.categoryBadge, { backgroundColor: 'rgba(0,122,255,0.12)' }]}>
                    <ThemedText type="small" style={styles.categoryBadgeText}>
                      {product.category || 'General'}
                    </ThemedText>
                  </View>
                  <View style={styles.ratingBox}>
                    <ThemedText style={styles.starText}>
                      {renderStars(product.rating ?? 4.5)}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary" style={{ marginLeft: 4 }}>
                      {product.rating ?? '4.5'}
                    </ThemedText>
                  </View>
                </View>

                {/* Product Name */}
                <ThemedText type="subtitle" style={styles.productName}>
                  {product.name}
                </ThemedText>

                {/* Price */}
                <ThemedText style={styles.priceText}>
                  {formatPrice(product.price)}
                </ThemedText>

                {/* Divider */}
                <View style={[styles.divider, { backgroundColor: 'rgba(128,128,128,0.15)' }]} />

                {/* Description */}
                <ThemedText type="smallBold" style={styles.sectionLabel}>
                  Description
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary" style={styles.descriptionText}>
                  {product.description || 'No description available for this product.'}
                </ThemedText>

                {/* Stock & Location */}
                {(product.stock !== undefined || product.location_text) && (
                  <>
                    <View style={[styles.divider, { backgroundColor: 'rgba(128,128,128,0.15)' }]} />
                    <View style={styles.infoGrid}>
                      {product.stock !== undefined && (
                        <View style={[styles.infoGridItem, { backgroundColor: theme.background }]}>
                          <SymbolView
                            tintColor={theme.textSecondary}
                            name={{ ios: 'shippingbox', android: 'inventory', web: 'inventory' } as any}
                            size={22}
                          />
                          <ThemedText type="small" themeColor="textSecondary" style={{ marginTop: 4 }}>
                            Stock
                          </ThemedText>
                          <ThemedText type="smallBold" style={{ fontSize: 18 }}>
                            {String(product.stock)}
                          </ThemedText>
                        </View>
                      )}
                      {!!product.location_text && (
                        <View style={[styles.infoGridItem, { backgroundColor: theme.background }]}>
                          <SymbolView
                            tintColor={theme.textSecondary}
                            name={{ ios: 'mappin.circle', android: 'location_on', web: 'location_on' } as any}
                            size={22}
                          />
                          <ThemedText type="small" themeColor="textSecondary" style={{ marginTop: 4 }}>
                            Location
                          </ThemedText>
                          <ThemedText type="smallBold" style={{ fontSize: 14 }}>
                            {product.location_text}
                          </ThemedText>
                        </View>
                      )}
                    </View>
                  </>
                )}

                {/* Admin Buttons */}
                {isAdmin && (
                  <>
                    <View style={[styles.divider, { backgroundColor: 'rgba(128,128,128,0.15)' }]} />
                    <ThemedText type="smallBold" style={styles.sectionLabel}>
                      Admin Actions
                    </ThemedText>
                    <View style={styles.adminButtons}>
                      <Pressable
                        onPress={() =>
                          router.push({
                            pathname: '/edit' as any,
                            params: { id: String(product.id) },
                          })
                        }
                        style={({ pressed }) => [
                          styles.actionBtn,
                          { backgroundColor: '#FF9500', flex: 1 },
                          pressed && styles.pressed,
                        ]}
                      >
                        <SymbolView
                          tintColor="#fff"
                          name={{ ios: 'pencil', android: 'edit', web: 'edit' } as any}
                          size={16}
                        />
                        <ThemedText type="smallBold" style={styles.actionBtnText}>
                          Edit
                        </ThemedText>
                      </Pressable>

                      <Pressable
                        onPress={handleDelete}
                        style={({ pressed }) => [
                          styles.actionBtn,
                          { backgroundColor: '#FF3B30', flex: 1 },
                          pressed && styles.pressed,
                        ]}
                      >
                        <SymbolView
                          tintColor="#fff"
                          name={{ ios: 'trash', android: 'delete', web: 'delete' } as any}
                          size={16}
                        />
                        <ThemedText type="smallBold" style={styles.actionBtnText}>
                          Delete
                        </ThemedText>
                      </Pressable>
                    </View>
                  </>
                )}
              </ThemedView>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingBottom: BottomTabInset + Spacing.six,
    alignItems: 'center',
  },

  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    minWidth: 72,
  },
  backText: { fontSize: 15 },
  navTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
  },

  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  detailWrapper: {
    width: '100%',
    maxWidth: 720,
    ...Platform.select({ web: { width: 'calc(100% - 0px)' as any } }),
  },

  heroImage: {
    width: '100%',
    height: 320,
  },
  heroPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  infoCard: {
    margin: Spacing.three,
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.three,
  },

  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: Spacing.two,
  },
  categoryBadgeText: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starText: {
    color: '#FFB300',
    fontSize: 14,
  },

  productName: {
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 32,
  },
  priceText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#007AFF',
  },

  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    opacity: 0.5,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 24,
  },

  divider: {
    height: 1,
    width: '100%',
  },

  infoGrid: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  infoGridItem: {
    flex: 1,
    borderRadius: Spacing.three,
    padding: Spacing.three,
    alignItems: 'center',
    gap: 2,
  },

  adminButtons: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },

  pressed: { opacity: 0.75 },
});
