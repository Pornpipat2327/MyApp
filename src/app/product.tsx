import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TopHeader } from '@/components/top-header';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { SymbolView } from 'expo-symbols';
import { useEffect, useMemo, useState } from 'react';
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

import { getProductsApiUrl } from '@/constants/api';
import { useLocalSearchParams, useRouter } from 'expo-router';


interface Product {
  id: string | number;
  name: string;
  category?: string;
  price: string | number;
  rating?: string | number;
  description?: string;
  image?: string;
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
      } catch (e) {
        setIsAdmin(false);
      }
    }
    if (params.category) {
      setSearchQuery(params.category);
    }
  }, [params.category]);

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

  const confirmAndDelete = async (productId: string | number, productName: string) => {
    try {
      const response = await fetch(`${getProductsApiUrl()}/${productId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (response.ok && data.success) {
        if (Platform.OS === 'web') {
          window.alert(`Successfully deleted "${productName}"`);
        } else {
          Alert.alert('Deleted', `Successfully deleted "${productName}"`);
        }
        fetchProducts();
      } else {
        const msg = data.message || 'Failed to delete product';
        if (Platform.OS === 'web') window.alert(msg);
        else Alert.alert('Error', msg);
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Network error while deleting';
      if (Platform.OS === 'web') window.alert(errMsg);
      else Alert.alert('Error', errMsg);
    }
  };

  const handleDeleteProduct = (productId: string | number, productName: string) => {
    if (Platform.OS === 'web') {
      const confirmDelete = window.confirm(`Are you sure you want to delete "${productName}"?`);
      if (confirmDelete) {
        confirmAndDelete(productId, productName);
      }
    } else {
      Alert.alert(
        'Confirm Delete',
        `Are you sure you want to delete "${productName}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => confirmAndDelete(productId, productName),
          },
        ]
      );
    }
  };

  const getImageSource = (imagePath?: string) => {
    if (imagePath && (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:'))) {
      return { uri: imagePath };
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
                <ThemedText type="smallBold" style={styles.buyButtonText}>
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
                  style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
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

                      <ThemedText type="smallBold" style={styles.productName}>
                        {product.name}
                      </ThemedText>

                      <ThemedText type="small" themeColor="textSecondary" style={styles.productDescription} numberOfLines={2}>
                        {product.description || 'No description available.'}
                      </ThemedText>

                      <View style={styles.priceRow}>
                        <ThemedText type="default" style={styles.priceText}>
                          {formatPrice(product.price)}
                        </ThemedText>
                        {isAdmin && (
                          <View style={{ flexDirection: 'row', gap: 6 }}>
                            <Pressable
                              onPress={(e) => {
                                e.stopPropagation?.();
                                router.push({
                                  pathname: '/edit' as any,
                                  params: {
                                    id: String(product.id),
                                  },
                                });
                              }}
                              style={({ pressed }) => [
                                styles.buyButton,
                                { backgroundColor: '#FF9500' },
                                pressed && styles.pressed,
                              ]}
                            >
                              <ThemedText type="smallBold" style={styles.buyButtonText}>
                                Edit
                              </ThemedText>
                            </Pressable>
                            <Pressable
                              onPress={(e) => {
                                e.stopPropagation?.();
                                handleDeleteProduct(product.id, product.name);
                              }}
                              style={({ pressed }) => [
                                styles.buyButton,
                                { backgroundColor: '#FF3B30' },
                                pressed && styles.pressed,
                              ]}
                            >
                              <ThemedText type="smallBold" style={styles.buyButtonText}>
                                Delete
                              </ThemedText>
                            </Pressable>
                          </View>
                        )}
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
    justifyContent: 'flex-start',
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  card: {
    width: '100%',
    borderRadius: Spacing.four,
    overflow: 'hidden',
    marginBottom: Spacing.three,
    ...Platform.select({
      web: {
        width: `calc(33.33% - ${(Spacing.three * 2) / 3}px)` as any,
        minWidth: 220,
      },
    }),
  },
  productImage: {
    width: '100%',
    height: 200,
    backgroundColor: 'rgba(128,128,128,0.05)',
  },
  cardContent: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ratingText: {
    fontSize: 12,
    color: '#FFB300',
    fontWeight: '600',
  },
  productName: {
    fontSize: 18,
    fontWeight: '700',
  },
  productDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.one,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
  },
  buyButton: {
    backgroundColor: '#007AFF',
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  buyButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
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
});

