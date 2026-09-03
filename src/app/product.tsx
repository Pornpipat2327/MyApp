/**
 * @file product.tsx
 * @description หน้ารายการสินค้าทั้งหมด สไตล์ Minecraft Voxel Design System
 * 0px Voxel Doctrine, Hero Banner With Green Accent Stripe, Filter Chips Row, และ Product Grid (3 Columns)
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  ActivityIndicator,
  Platform,
  Pressable,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { TopHeader } from '@/components/top-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PriceRangeFilter } from '@/components/price-range-filter';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Product } from '@/types/product';
import { getProductsApiUrl } from '@/constants/api';
import { ProductCard } from '@/components/product/product-card';
import { getImageSource } from '@/utils/image';
import { getStorageItem } from '@/utils/storage';

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name';

export default function ProductScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string; search?: string }>();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState(params.search || params.category || '');
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [ratingFourPlus, setRatingFourPlus] = useState(false);

  // คำนวณช่วงราคาขั้นต่ำ-สูงสุดที่มีในฐานข้อมูล
  const { absMin, absMax } = useMemo(() => {
    if (products.length === 0) return { absMin: 0, absMax: 10000 };
    const numericPrices = products
      .map((p) => Number(p.price || 0))
      .filter((n) => !isNaN(n) && n >= 0);
    if (numericPrices.length === 0) return { absMin: 0, absMax: 10000 };
    const min = Math.floor(Math.min(...numericPrices));
    const max = Math.ceil(Math.max(...numericPrices));
    return {
      absMin: Math.max(0, min),
      absMax: Math.max(min + 100, max),
    };
  }, [products]);

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [hasCustomPriceFilter, setHasCustomPriceFilter] = useState(false);

  const currentPriceRange: [number, number] = useMemo(() => {
    return hasCustomPriceFilter ? priceRange : [absMin, absMax];
  }, [hasCustomPriceFilter, priceRange, absMin, absMax]);

  /**
   * ฟังก์ชันดึงรายการสินค้าจาก API
   */
  const fetchProducts = useCallback(async () => {
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
        price: Number(d.price ?? d.Price ?? 0),
        rating: Number(d.rating ?? d.Rating ?? 4.5),
        description: d.description ?? d.Description ?? '',
        image: d.image ?? d.Image ?? d.image_url ?? '',
        stock:
          d.stock !== undefined
            ? Number(d.stock)
            : d.Stock !== undefined
            ? Number(d.Stock)
            : 0,
        location: d.location ?? d.Location ?? '',
      }));
      setProducts(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ไม่สามารถโหลดข้อมูลสินค้าได้');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      const userStr = getStorageItem('user');
      if (!userStr) {
        router.replace('/login' as any);
        return;
      }
      if (params.search !== undefined) {
        setSearchQuery(params.search);
      } else if (params.category !== undefined) {
        setSearchQuery(params.category);
      }
      fetchProducts();
    }, [params.category, params.search, fetchProducts, router])
  );

  const handlePriceChange = (min: number, max: number) => {
    setPriceRange([min, max]);
    setHasCustomPriceFilter(true);
  };

  const handleResetPriceFilter = () => {
    setPriceRange([absMin, absMax]);
    setHasCustomPriceFilter(false);
  };

  const resetAllFilters = () => {
    setSearchQuery('');
    setInStockOnly(false);
    setRatingFourPlus(false);
    handleResetPriceFilter();
    setSortOption('default');
  };

  const isAnyFilterActive =
    searchQuery.trim().length > 0 ||
    inStockOnly ||
    ratingFourPlus ||
    hasCustomPriceFilter ||
    sortOption !== 'default';

  const handleToggleSort = () => {
    if (sortOption === 'default') setSortOption('price-asc');
    else if (sortOption === 'price-asc') setSortOption('price-desc');
    else if (sortOption === 'price-desc') setSortOption('name');
    else setSortOption('default');
  };

  const getSortLabel = () => {
    if (sortOption === 'price-asc') return 'Price: Low to High';
    if (sortOption === 'price-desc') return 'Price: High to Low';
    if (sortOption === 'name') return 'Name: A to Z';
    return 'Default Order';
  };

  // กรองและเรียงลำดับสินค้า
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // 1. ค้นหา
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.category && p.category.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // 2. ราคา
    if (hasCustomPriceFilter) {
      list = list.filter((p) => {
        const price = Number(p.price) || 0;
        return price >= currentPriceRange[0] && price <= currentPriceRange[1];
      });
    }

    // 3. สต็อก
    if (inStockOnly) {
      list = list.filter((p) => (Number(p.stock) || 0) > 0);
    }

    // 4. เรตติ้ง 4.0+
    if (ratingFourPlus) {
      list = list.filter((p) => (Number(p.rating) || 0) >= 4.0);
    }

    // 5. เรียงลำดับ
    if (sortOption === 'price-asc') {
      list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (sortOption === 'price-desc') {
      list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    } else if (sortOption === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [
    products,
    searchQuery,
    hasCustomPriceFilter,
    currentPriceRange,
    inStockOnly,
    ratingFourPlus,
    sortOption,
  ]);

  // สินค้าแนะนำเมื่อค้นหาไม่พบ
  const recommendedProducts = useMemo(() => {
    return products.slice(0, 4);
  }, [products]);

  return (
    <ThemedView type="background" style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <TopHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Banner Section - Minecraft Voxel Banner with Green Left Stripe */}
          <View style={[styles.heroBanner, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText type="subtitle" style={styles.heroTitle}>
              All Products
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.heroSubtitle}>
              Browse our full collection of premium keyboards, crafted for every style and workflow.
            </ThemedText>
          </View>

          {/* Level 3: Advanced Price Range & Filter Bar */}
          {!loading && !error && (
            <View style={styles.filterBarContainer}>
              <View style={styles.priceRangeCard}>
                <PriceRangeFilter
                  absoluteMin={absMin}
                  absoluteMax={absMax}
                  minPrice={currentPriceRange[0]}
                  maxPrice={currentPriceRange[1]}
                  onPriceChange={handlePriceChange}
                  onReset={handleResetPriceFilter}
                />

                <View style={styles.filterChipsRow}>
                  {/* In Stock Only */}
                  <Pressable
                    onPress={() => setInStockOnly(!inStockOnly)}
                    style={[styles.filterChip, inStockOnly && styles.filterChipActive]}
                  >
                    <ThemedText
                      type="smallBold"
                      style={[styles.filterChipText, inStockOnly && styles.filterChipTextActive]}
                    >
                      📦 In Stock Only
                    </ThemedText>
                  </Pressable>

                  {/* Rating 4.0+ */}
                  <Pressable
                    onPress={() => setRatingFourPlus(!ratingFourPlus)}
                    style={[styles.filterChip, ratingFourPlus && styles.filterChipActive]}
                  >
                    <ThemedText
                      type="smallBold"
                      style={[
                        styles.filterChipText,
                        ratingFourPlus && styles.filterChipTextActive,
                      ]}
                    >
                      ★ 4.0+ Stars
                    </ThemedText>
                  </Pressable>

                  {/* Reset Filters CTA */}
                  {isAnyFilterActive && (
                    <Pressable onPress={resetAllFilters} style={styles.resetFilterChip}>
                      <ThemedText type="smallBold" style={styles.resetFilterText}>
                        ✕ ล้างตัวกรอง
                      </ThemedText>
                    </Pressable>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* Section Header */}
          {!loading && !error && (
            <View style={styles.sectionHeader}>
              <ThemedText type="smallBold" style={styles.sectionTitle}>
                {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'}
                {searchQuery.trim() ? ` matching "${searchQuery}"` : ''}
              </ThemedText>
              <Pressable onPress={handleToggleSort} style={({ pressed }) => pressed && styles.pressed}>
                <View style={styles.sortButton}>
                  <SymbolView
                    tintColor={theme.textSecondary}
                    name={{
                      ios: 'line.3.horizontal.decrease',
                      android: 'filter_list',
                      web: 'filter_list',
                    }}
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
              <ThemedText
                type="small"
                themeColor="textSecondary"
                style={{ marginTop: Spacing.two }}
              >
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
              <Pressable onPress={fetchProducts} style={styles.retryButton}>
                <ThemedText type="smallBold" style={styles.retryButtonText}>
                  Retry
                </ThemedText>
              </Pressable>
            </View>
          )}

          {/* Empty State with Recovery Showcase */}
          {!loading && !error && filteredProducts.length === 0 && (
            <View style={styles.emptyRecoveryCard}>
              <View style={styles.emptyIconCircle}>
                <SymbolView
                  name={{
                    ios: 'exclamationmark.magnifyingglass',
                    android: 'search_off',
                    web: 'search_off',
                  }}
                  tintColor="#ff605e"
                  size={32}
                />
              </View>
              <ThemedText type="subtitle" style={styles.emptyTitle}>
                No Keyboards Found
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.emptySubtitle}>
                We couldn&apos;t find any keyboards matching{' '}
                {searchQuery ? `"${searchQuery}"` : 'your active filters'}.
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
                    {recommendedProducts.map((p) => {
                      const recSrc = getImageSource(p.image);
                      return (
                        <Pressable
                          key={p.id}
                          onPress={() =>
                            router.push({
                              pathname: '/detail' as any,
                              params: { id: String(p.id) },
                            })
                          }
                          style={styles.recommendedCard}
                        >
                          <View style={styles.recThumb}>
                            {recSrc ? (
                              <Image source={recSrc} style={styles.recImg} resizeMode="cover" />
                            ) : (
                              <View style={styles.recPlaceholder}>
                                <SymbolView
                                  tintColor="#898481"
                                  name={{ ios: 'keyboard', android: 'keyboard', web: 'keyboard' }}
                                  size={16}
                                />
                              </View>
                            )}
                          </View>
                          <ThemedText type="smallBold" numberOfLines={1} style={styles.recName}>
                            {p.name}
                          </ThemedText>
                          <ThemedText type="smallBold" style={styles.recPrice}>
                            ${Number(p.price || 0).toFixed(2)}
                          </ThemedText>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Products Grid - Minecraft 3-column Layout */}
          {!loading && !error && filteredProducts.length > 0 && (
            <View style={styles.productsGrid}>
              {filteredProducts.map((product, index) => (
                <ProductCard
                  key={product.id ?? index}
                  product={product}
                  onPress={(p) =>
                    router.push({
                      pathname: '/detail' as any,
                      params: { id: String(p.id) },
                    })
                  }
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
    borderRadius: 0, // 0px voxel doctrine
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
  priceRangeCard: {
    backgroundColor: '#262423',
    borderWidth: 1,
    borderColor: '#3d3938',
    borderRadius: 0, // 0px voxel doctrine
    padding: Spacing.three,
    gap: Spacing.two,
  },
  filterChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    rowGap: Spacing.two,
    flexWrap: 'wrap',
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
    backgroundColor: '#3c8527', // vanilla-green-5
    borderColor: '#6cc349', // vanilla-green-3
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
