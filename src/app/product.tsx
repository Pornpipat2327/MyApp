import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TopHeader } from '@/components/top-header';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { SymbolView } from 'expo-symbols';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getProductsApiUrl, getBaseUrl } from '@/constants/api';
import { useLocalSearchParams, useRouter } from 'expo-router';

interface Product {
  id: string | number;
  name: string;
  category?: string;
  price: string | number;
  rating?: string | number;
  description?: string;
  image?: string;
  stock?: number;
  location?: string;
}

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name';

export default function ProductScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [searchQuery, setSearchQuery] = useState(params.category || '');

  // Auth check and refetch products every time this screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'web') {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          router.replace('/login' as any);
          return;
        }
      }
      if (params.category) {
        setSearchQuery(params.category);
      }
      fetchProducts();
    }, [params.category])
  );

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(getProductsApiUrl());
      const json = await response.json();
      if (!response.ok || (json && json.success === false)) {
        throw new Error(json?.message || `HTTP error! status: ${response.status}`);
      }
      const rawData = Array.isArray(json) ? json : json.data || [];
      const items: Product[] = rawData.map((d: any) => ({
        id: d.id ?? d.Product_ID ?? d.ProductCode,
        name: d.name ?? d.Name ?? '',
        category: d.category ?? d.Category ?? 'General',
        price: d.price ?? d.Price ?? 0,
        rating: d.rating ?? d.Rating ?? 4.5,
        description: d.description ?? d.Description ?? '',
        image: d.image ?? d.Image ?? d.image_url ?? '',
        stock: d.stock !== undefined ? Number(d.stock) : (d.Stock !== undefined ? Number(d.Stock) : 0),
        location: d.location ?? d.Location ?? '',
      }));
      setProducts(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

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

  const handleToggleSort = () => {
    setSortOption((prev) => {
      if (prev === 'default') return 'price-asc';
      if (prev === 'price-asc') return 'price-desc';
      if (prev === 'price-desc') return 'name';
      return 'default';
    });
  };

  const sortedProducts = useMemo(() => {
    let list = [...products];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    if (sortOption === 'price-asc') {
      return list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    }
    if (sortOption === 'price-desc') {
      return list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    }
    if (sortOption === 'name') {
      return list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }
    return list;
  }, [products, searchQuery, sortOption]);

  const getSortLabel = () => {
    switch (sortOption) {
      case 'price-asc':
        return 'Price: Low to High';
      case 'price-desc':
        return 'Price: High to Low';
      case 'name':
        return 'Name';
      default:
        return 'Sort';
    }
  };

  const formatPrice = (price: string | number) => {
    if (typeof price === 'number') {
      return `$${price.toFixed(2)}`;
    }
    if (!price) return '$0.00';
    return String(price).startsWith('$') ? String(price) : `$${price}`;
  };

  return (
    <ThemedView type="background" style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <TopHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Banner Section */}
          <View style={[styles.heroBanner, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText type="subtitle" style={styles.heroTitle}>
              All Products
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.heroSubtitle}>
              Browse our full collection of premium keyboards, crafted for every style and workflow.
            </ThemedText>
          </View>

          {/* Section Header — hidden while loading */}
          {!loading && !error && (
            <View style={styles.sectionHeader}>
              <ThemedText type="smallBold" style={styles.sectionTitle}>
                {sortedProducts.length} Products
              </ThemedText>
              <Pressable onPress={handleToggleSort} style={({ pressed }) => pressed && styles.pressed}>
                <View style={styles.sortButton}>
                  <SymbolView
                    tintColor={theme.textSecondary}
                    name={{ ios: 'line.3.horizontal.decrease', android: 'filter_list', web: 'filter_list' }}
                    size={16}
                  />
                  <ThemedText type="small" themeColor="textSecondary">
                    {getSortLabel()}
                  </ThemedText>
                </View>
              </Pressable>
            </View>
          )}

          {/* Loading State */}
          {loading && (
            <View style={styles.centerState}>
              <ActivityIndicator size="large" color={theme.text} />
              <ThemedText type="small" themeColor="textSecondary" style={{ marginTop: Spacing.two }}>
                Loading products...
              </ThemedText>
            </View>
          )}

          {/* Error State */}
          {error && !loading && (
            <View style={styles.centerState}>
              <ThemedText type="small" style={{ color: '#FF3B30' }}>
                {error}
              </ThemedText>
              <Pressable
                onPress={fetchProducts}
                style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
              >
                <ThemedText type="smallBold" style={styles.retryButtonText}>
                  Retry
                </ThemedText>
              </Pressable>
            </View>
          )}

          {/* Empty State */}
          {!loading && !error && sortedProducts.length === 0 && (
            <View style={styles.centerState}>
              <ThemedText type="small" themeColor="textSecondary">
                No products found.
              </ThemedText>
            </View>
          )}

          {/* Products Grid */}
          {!loading && !error && sortedProducts.length > 0 && (
            <View style={styles.productsGrid}>
              {sortedProducts.map((product, index) => (
                <Pressable
                  key={product.id ?? index}
                  onPress={() =>
                    router.push({
                      pathname: '/detail' as any,
                      params: { id: String(product.id) },
                    })
                  }
                  style={({ pressed }) => [styles.cardPressable, { opacity: pressed ? 0.88 : 1 }]}
                >
                  <ThemedView type="backgroundElement" style={styles.card}>
                    {getImageSource(product.image) ? (
                      <Image
                        source={getImageSource(product.image)!}
                        style={styles.productImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[styles.productImage, { alignItems: 'center', justifyContent: 'center', backgroundColor: theme.backgroundSelected }]}>
                        <SymbolView name={{ ios: 'keyboard', android: 'keyboard', web: 'keyboard' }} tintColor={theme.textSecondary} size={48} />
                      </View>
                    )}
                    <View style={styles.cardContent}>
                      <View style={styles.categoryRow}>
                        <ThemedText type="small" themeColor="textSecondary" style={styles.categoryText}>
                          {product.category || 'General'}
                        </ThemedText>
                        <ThemedText type="small" style={styles.ratingText}>
                          ★ {product.rating ?? '4.5'}
                        </ThemedText>
                      </View>

                      <ThemedText type="smallBold" style={styles.productName} numberOfLines={2}>
                        {product.name}
                      </ThemedText>

                      <View style={styles.priceRow}>
                        <ThemedText type="default" style={styles.priceText}>
                          {formatPrice(product.price)}
                        </ThemedText>
                      </View>
                    </View>
                  </ThemedView>
                </Pressable>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: BottomTabInset + Spacing.four,
  },
  heroBanner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.six,
    borderRadius: Spacing.four,
    marginTop: Spacing.three,
    marginBottom: Spacing.four,
    gap: Spacing.two,
    ...Platform.select({
      web: {
        width: `calc(100% - ${Spacing.four * 2}px)` as any,
      },
    }),
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
  },
  heroSubtitle: {
    maxWidth: 500,
  },
  sectionHeader: {
    width: '100%',
    maxWidth: MaxContentWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.three,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  productsGrid: {
    width: '100%',
    maxWidth: MaxContentWidth,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'stretch',
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  cardPressable: {
    width: '100%',
    ...Platform.select({
      web: {
        width: `calc(33.33% - ${(Spacing.three * 2) / 3}px)` as any,
        minWidth: 220,
      },
    }),
  },
  card: {
    flex: 1,
    borderRadius: Spacing.four,
    overflow: 'hidden',
    marginBottom: Spacing.two,
  },
  productImage: {
    width: '100%',
    height: 190,
    backgroundColor: 'rgba(128,128,128,0.05)',
  },
  cardContent: {
    padding: Spacing.three,
    gap: Spacing.one,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  categoryText: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  ratingText: {
    fontSize: 12,
    color: '#FFB300',
    fontWeight: '600',
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    minHeight: 44,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: Spacing.one,
  },
  priceText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#007AFF',
  },
  pressed: {
    opacity: 0.8,
  },
  centerState: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.six,
    gap: Spacing.three,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.three,
    marginTop: Spacing.two,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});


