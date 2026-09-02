/**
 * @file product.tsx
 * @description หน้ารายการสินค้าทั้งหมด (Product Catalog Screen)
 * ประกอบด้วยระบบค้นหา, ตัวกรองหมวดหมู่, ตัวกรองช่วงราคา, การเรียงลำดับ และการ์ดแสดงสินค้า
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { TopHeader } from '@/components/top-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PriceRangeFilter } from '@/components/price-range-filter';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useCart } from '@/hooks/use-cart';
import { Product } from '@/types/product';
import { getProductsApiUrl } from '@/constants/api';
import { ProductCard } from '@/components/product/product-card';
import { ProductToolbar, SortOption } from '@/components/product/product-toolbar';

export default function ProductScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string; search?: string }>();
  const { addToCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState(params.search || params.category || '');
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [ratingFourPlus, setRatingFourPlus] = useState(false);
  const [showPriceFilter, setShowPriceFilter] = useState(false);

  // คำนวณช่วงราคาขั้นต่ำ-สูงสุดที่มีในฐานข้อมูล
  const { absMin, absMax } = useMemo(() => {
    if (products.length === 0) return { absMin: 0, absMax: 1000 };
    const numericPrices = products
      .map((p) => Number(p.price || 0))
      .filter((n) => !isNaN(n) && n >= 0);
    if (numericPrices.length === 0) return { absMin: 0, absMax: 1000 };
    const min = Math.floor(Math.min(...numericPrices));
    const max = Math.ceil(Math.max(...numericPrices));
    return {
      absMin: Math.max(0, min),
      absMax: Math.max(min + 10, max),
    };
  }, [products]);

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [hasCustomPriceFilter, setHasCustomPriceFilter] = useState(false);

  /**
   * ฟังก์ชันดึงรายการสินค้าจาก API
   * ประกาศไว้ก่อนการใช้งานใน hooks เพื่อป้องกันปัญหา Cannot access variable before it is declared
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
        price: d.price ?? d.Price ?? 0,
        rating: d.rating ?? d.Rating ?? 4.5,
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

  const currentPriceRange: [number, number] = useMemo(() => {
    return hasCustomPriceFilter ? priceRange : [absMin, absMax];
  }, [hasCustomPriceFilter, priceRange, absMin, absMax]);

  // ตรวจสอบการเข้าสู่ระบบและโหลดสินค้าเมื่อเข้าสู่หน้านี้
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

  // กรองและเรียงลำดับสินค้า
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // 1. กรองตามคำค้นหา / หมวดหมู่
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.category && p.category.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // 2. กรองตามช่วงราคา
    if (hasCustomPriceFilter) {
      list = list.filter((p) => {
        const price = Number(p.price) || 0;
        return price >= currentPriceRange[0] && price <= currentPriceRange[1];
      });
    }

    // 3. กรองเฉพาะที่มีสต็อก
    if (inStockOnly) {
      list = list.filter((p) => (Number(p.stock) || 0) > 0);
    }

    // 4. กรองคะแนน 4.0 ขึ้นไป
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

  return (
    <ThemedView type="background" style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <TopHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* แถบเครื่องมือเรียงลำดับและตัวกรอง */}
          <ProductToolbar
            totalCount={filteredProducts.length}
            inStockOnly={inStockOnly}
            onToggleInStock={() => setInStockOnly(!inStockOnly)}
            ratingFourPlus={ratingFourPlus}
            onToggleRating={() => setRatingFourPlus(!ratingFourPlus)}
            sortOption={sortOption}
            onChangeSort={setSortOption}
            showPriceFilter={showPriceFilter}
            onTogglePriceFilter={() => setShowPriceFilter(!showPriceFilter)}
          />

          {/* แผงตัวกรองช่วงราคาแบบพับได้ */}
          {showPriceFilter && (
            <View style={{ marginBottom: Spacing.three }}>
              <PriceRangeFilter
                absoluteMin={absMin}
                absoluteMax={absMax}
                minPrice={currentPriceRange[0]}
                maxPrice={currentPriceRange[1]}
                onPriceChange={handlePriceChange}
                onReset={handleResetPriceFilter}
              />
            </View>
          )}

          {/* แสดงสถานะโหลด หรือ ข้อผิดพลาด */}
          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#6cc349" />
              <ThemedText type="small" themeColor="textSecondary" style={{ marginTop: 12 }}>
                กำลังโหลดรายการสินค้า...
              </ThemedText>
            </View>
          ) : error ? (
            <View style={styles.centerContainer}>
              <ThemedText style={{ color: '#FF3B30' }}>⚠️ {error}</ThemedText>
            </View>
          ) : filteredProducts.length === 0 ? (
            <ThemedView type="backgroundElement" style={styles.emptyContainer}>
              <ThemedText type="smallBold">ไม่พบคีย์บอร์ดที่ตรงกับเงื่อนไข</ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={{ marginTop: 4 }}>
                ลองเปลี่ยนคำค้นหา หรือรีเซ็ตตัวกรองราคา
              </ThemedText>
            </ThemedView>
          ) : (
            /* Grid สินค้า */
            <View style={styles.grid}>
              {filteredProducts.map((item) => (
                <ProductCard
                  key={item.id}
                  product={item}
                  onPress={(p) =>
                    router.push({
                      pathname: '/detail' as any,
                      params: { id: String(p.id) },
                    })
                  }
                  onAddToCart={(p) => addToCart(p, 1)}
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
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
    padding: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.six,
  },
  centerContainer: {
    paddingVertical: Spacing.six,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: Spacing.six,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.15)',
    marginTop: Spacing.four,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
});
