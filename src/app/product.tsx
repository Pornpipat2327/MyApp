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
type PriceFilter = 'all' | 'under100' | '100to200' | 'over200';

export default function ProductScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string; search?: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState(params.search || params.category || '');
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [ratingFourPlus, setRatingFourPlus] = useState(false);

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
      if (params.search !== undefined) {
        setSearchQuery(params.search);
      } else if (params.category !== undefined) {
        setSearchQuery(params.category);
      }
      fetchProducts();
    }, [params.category, params.search])
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

  const isAnyFilterActive =
    searchQuery.trim() !== '' ||
    priceFilter !== 'all' ||
    inStockOnly ||
    ratingFourPlus;

  const resetAllFilters = () => {
    setSearchQuery('');
    setPriceFilter('all');
    setInStockOnly(false);
    setRatingFourPlus(false);
    setSortOption('default');
  };

  // Level 1 & 2: Multi-token search + Level 3: Multi-faceted filters
  const sortedProducts = useMemo(() => {
    let list = [...products];

    // Multi-token keyword search
    if (searchQuery.trim()) {
      const qTokens = searchQuery.toLowerCase().trim().split(/\s+/);
      list = list.filter((p) => {
        const text = `${p.name} ${p.category || ''} ${p.description || ''} ${p.location || ''}`.toLowerCase();
        return qTokens.every((token) => text.includes(token));
      });
    }

    // Price Filter
    if (priceFilter === 'under100') {
      list = list.filter((p) => Number(p.price || 0) < 100);
    } else if (priceFilter === '100to200') {
      list = list.filter((p) => Number(p.price || 0) >= 100 && Number(p.price || 0) <= 200);
    } else if (priceFilter === 'over200') {
      list = list.filter((p) => Number(p.price || 0) > 200);
    }

    // In Stock Only
    if (inStockOnly) {
      list = list.filter((p) => (p.stock ?? 0) > 0);
    }

    // Rating Filter (4+ stars)
    if (ratingFourPlus) {
      list = list.filter((p) => Number(p.rating ?? 0) >= 4.0);
    }

    // Sorting
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
  }, [products, searchQuery, priceFilter, inStockOnly, ratingFourPlus, sortOption]);

  // Level 4: Recommended keyboards when 0 matches
  const recommendedProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
      .slice(0, 3);
  }, [products]);

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

          {/* Level 3: Advanced Filter Bar */}
          {!loading && !error && (
            <View style={styles.filterBarContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChipsRow}>
                {/* Price Filter Chips */}
                <Pressable
                  onPress={() => setPriceFilter('all')}
                  style={[styles.filterChip, priceFilter === 'all' && styles.filterChipActive]}
                >
                  <ThemedText type="smallBold" style={[styles.filterChipText, priceFilter === 'all' && styles.filterChipTextActive]}>
                    All Prices
                  </ThemedText>
                </Pressable>

                <Pressable
                  onPress={() => setPriceFilter(priceFilter === 'under100' ? 'all' : 'under100')}
                  style={[styles.filterChip, priceFilter === 'under100' && styles.filterChipActive]}
                >
                  <ThemedText type="smallBold" style={[styles.filterChipText, priceFilter === 'under100' && styles.filterChipTextActive]}>
                    &lt; $100
                  </ThemedText>
                </Pressable>

                <Pressable
                  onPress={() => setPriceFilter(priceFilter === '100to200' ? 'all' : '100to200')}
                  style={[styles.filterChip, priceFilter === '100to200' && styles.filterChipActive]}
                >
                  <ThemedText type="smallBold" style={[styles.filterChipText, priceFilter === '100to200' && styles.filterChipTextActive]}>
                    $100 - $200
                  </ThemedText>
                </Pressable>

                <Pressable
                  onPress={() => setPriceFilter(priceFilter === 'over200' ? 'all' : 'over200')}
                  style={[styles.filterChip, priceFilter === 'over200' && styles.filterChipActive]}
                >
                  <ThemedText type="smallBold" style={[styles.filterChipText, priceFilter === 'over200' && styles.filterChipTextActive]}>
                    &gt; $200
                  </ThemedText>
                </Pressable>

                {/* In Stock Only */}
                <Pressable
                  onPress={() => setInStockOnly(!inStockOnly)}
                  style={[styles.filterChip, inStockOnly && styles.filterChipActive]}
                >
                  <ThemedText type="smallBold" style={[styles.filterChipText, inStockOnly && styles.filterChipTextActive]}>
                    📦 In Stock
                  </ThemedText>
                </Pressable>

                {/* Rating 4.0+ */}
                <Pressable
                  onPress={() => setRatingFourPlus(!ratingFourPlus)}
                  style={[styles.filterChip, ratingFourPlus && styles.filterChipActive]}
                >
                  <ThemedText type="smallBold" style={[styles.filterChipText, ratingFourPlus && styles.filterChipTextActive]}>
                    ★ 4.0+
                  </ThemedText>
                </Pressable>

                {/* Reset Filters CTA */}
                {isAnyFilterActive && (
                  <Pressable onPress={resetAllFilters} style={styles.resetFilterChip}>
                    <ThemedText type="smallBold" style={styles.resetFilterText}>
                      ✕ Reset All
                    </ThemedText>
                  </Pressable>
                )}
              </ScrollView>
            </View>
          )}

          {/* Section Header */}
          {!loading && !error && (
            <View style={styles.sectionHeader}>
              <ThemedText type="smallBold" style={styles.sectionTitle}>
                {sortedProducts.length} {sortedProducts.length === 1 ? 'Product' : 'Products'}
                {searchQuery.trim() ? ` matching "${searchQuery}"` : ''}
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
              <ActivityIndicator size="large" color="#6cc349" />
              <ThemedText type="small" themeColor="textSecondary" style={{ marginTop: Spacing.two }}>
                Loading products...
              </ThemedText>
            </View>
          )}

          {/* Error State */}
          {error && !loading && (
            <View style={styles.centerState}>
              <ThemedText type="small" style={{ color: '#ff605e' }}>
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

          {/* Level 4: Empty State & Zero-Result Recovery */}
          {!loading && !error && sortedProducts.length === 0 && (
            <View style={styles.emptyRecoveryCard}>
              <View style={styles.emptyIconCircle}>
                <SymbolView
                  tintColor="#ff605e"
                  name={{ ios: 'magnifyingglass', android: 'search_off', web: 'search_off' } as any}
                  size={36}
                />
              </View>
              <ThemedText type="subtitle" style={styles.emptyTitle}>
                No Keyboards Found
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.emptySubtitle}>
                We couldn't find any keyboards matching {searchQuery ? `"${searchQuery}"` : 'your active filters'}.
              </ThemedText>

              {isAnyFilterActive && (
                <Pressable onPress={resetAllFilters} style={styles.resetBtn}>
                  <ThemedText type="smallBold" style={styles.resetBtnText}>
                    Clear All Filters & Show Everything
                  </ThemedText>
                </Pressable>
              )}

              {/* Recommended Showcase */}
              {recommendedProducts.length > 0 && (
                <View style={styles.recommendedSection}>
                  <ThemedText type="smallBold" style={styles.recommendedHeader}>
                    ✨ Recommended For You
                  </ThemedText>
                  <View style={styles.recommendedGrid}>
                    {recommendedProducts.map((p) => (
                      <Pressable
                        key={p.id}
                        onPress={() => router.push({ pathname: '/detail' as any, params: { id: String(p.id) } })}
                        style={styles.recommendedCard}
                      >
                        <View style={styles.recThumb}>
                          {getImageSource(p.image) ? (
                            <Image source={getImageSource(p.image)!} style={styles.recImg} resizeMode="cover" />
                          ) : (
                            <View style={styles.recPlaceholder}>
                              <SymbolView tintColor="#898481" name={{ ios: 'keyboard', android: 'keyboard', web: 'keyboard' } as any} size={16} />
                            </View>
                          )}
                        </View>
                        <ThemedText type="smallBold" numberOfLines={1} style={styles.recName}>
                          {p.name}
                        </ThemedText>
                        <ThemedText type="smallBold" style={styles.recPrice}>
                          {formatPrice(p.price)}
                        </ThemedText>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}
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
                      <View style={[styles.productImage, { alignItems: 'center', justifyContent: 'center', backgroundColor: '#1d1e1e' }]}>
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
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#3d3938',
    borderLeftWidth: 4,
    borderLeftColor: '#6cc349',
    marginTop: Spacing.three,
    marginBottom: Spacing.three,
    gap: Spacing.two,
    ...Platform.select({
      web: {
        width: `calc(100% - ${Spacing.four * 2}px)` as any,
      },
    }),
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 26,
    color: '#ffffff',
    ...Platform.select({ web: { fontFamily: 'var(--font-sans)' } }),
  },
  heroSubtitle: {
    maxWidth: 500,
    color: '#d0c5c0',
  },
  filterBarContainer: {
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.three,
  },
  filterChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: 2,
  },
  filterChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + 2,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#3d3938',
    backgroundColor: '#262423',
  },
  filterChipActive: {
    backgroundColor: '#3c8527',           // vanilla-green-5
    borderColor: '#6cc349',               // vanilla-green-3
  },
  filterChipText: {
    fontSize: 12,
    color: '#d0c5c0',
  },
  filterChipTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  resetFilterChip: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one + 2,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#ff605e',
    backgroundColor: 'rgba(255, 96, 94, 0.12)',
  },
  resetFilterText: {
    fontSize: 12,
    color: '#ff605e',
    fontWeight: '700',
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
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: '#d0c5c0',
    ...Platform.select({ web: { fontFamily: 'var(--font-sans)' } }),
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
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#3d3938',
    overflow: 'hidden',
    marginBottom: Spacing.two,
  },
  productImage: {
    width: '100%',
    height: 190,
    backgroundColor: '#1d1e1e',
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
    letterSpacing: 1,
    fontWeight: '700',
    color: '#6cc349',
  },
  ratingText: {
    fontSize: 12,
    color: '#ffc42b',
    fontWeight: '700',
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
    color: '#6cc349',
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
    backgroundColor: '#3c8527',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#262423',
    marginTop: Spacing.two,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  emptyRecoveryCard: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignItems: 'center',
    paddingVertical: Spacing.six,
    paddingHorizontal: Spacing.four,
    backgroundColor: '#262423',
    borderWidth: 1,
    borderColor: '#3d3938',
    borderRadius: 0,
    gap: Spacing.two,
    marginVertical: Spacing.four,
    ...Platform.select({
      web: {
        width: `calc(100% - ${Spacing.four * 2}px)` as any,
      },
    }),
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 0,
    backgroundColor: 'rgba(255, 96, 94, 0.12)',
    borderWidth: 1,
    borderColor: '#ff605e',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  emptySubtitle: {
    textAlign: 'center',
    maxWidth: 420,
    color: '#d0c5c0',
  },
  resetBtn: {
    marginTop: Spacing.two,
    backgroundColor: '#3c8527',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#262423',
  },
  resetBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  recommendedSection: {
    width: '100%',
    marginTop: Spacing.five,
    borderTopWidth: 1,
    borderTopColor: '#3d3938',
    paddingTop: Spacing.four,
  },
  recommendedHeader: {
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#6cc349',
    marginBottom: Spacing.three,
    textAlign: 'center',
  },
  recommendedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    justifyContent: 'center',
  },
  recommendedCard: {
    backgroundColor: '#313131',
    borderWidth: 1,
    borderColor: '#3d3938',
    borderRadius: 0,
    padding: Spacing.two,
    width: 140,
    alignItems: 'center',
    gap: 4,
  },
  recThumb: {
    width: 120,
    height: 80,
    backgroundColor: '#1d1e1e',
    overflow: 'hidden',
  },
  recImg: {
    width: '100%',
    height: '100%',
  },
  recPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recName: {
    fontSize: 12,
    color: '#ede5e2',
    textAlign: 'center',
  },
  recPrice: {
    fontSize: 12,
    color: '#6cc349',
    fontWeight: '800',
  },
});
