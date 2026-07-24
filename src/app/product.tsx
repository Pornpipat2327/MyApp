import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TopHeader } from '@/components/top-header';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
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

const API_URL = 'http://119.59.102.161:3032/api/items';

interface Product {
  id: string | number;
  name: string;
  category?: string;
  price: string | number;
  rating?: string;
  description?: string;
  image?: string;
}

// Map image path strings from the API to local require() assets.
// React Native requires static require calls, so we map them explicitly.
const IMAGE_MAP: Record<string, any> = {
  '@/assets/images/keyboard_mechanical_rgb.png': require('@/assets/images/keyboard_mechanical_rgb.png'),
  '@/assets/images/keyboard_wireless_white.png': require('@/assets/images/keyboard_wireless_white.png'),
  '@/assets/images/keyboard_retro_vintage.png': require('@/assets/images/keyboard_retro_vintage.png'),
  '@/assets/images/keyboard_ergonomic_split.png': require('@/assets/images/keyboard_ergonomic_split.png'),
  '@/assets/images/keyboard_compact_60.png': require('@/assets/images/keyboard_compact_60.png'),
};

export default function ProductScreen() {
  const theme = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const json = await response.json();
        const items: Product[] = Array.isArray(json) ? json : (json.data || []);
        setProducts(items);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const getImageSource = (imagePath: string) => {
    return IMAGE_MAP[imagePath] ?? null;
  };

  return (
    <ThemedView type="background" style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <TopHeader />

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
                {products.length} Products
              </ThemedText>
              <Pressable style={({ pressed }) => pressed && styles.pressed}>
                <View style={styles.sortButton}>
                  <SymbolView
                    tintColor={theme.textSecondary}
                    name={{ ios: 'line.3.horizontal.decrease', android: 'filter_list', web: 'filter_list' }}
                    size={16}
                  />
                  <ThemedText type="small" themeColor="textSecondary">
                    Sort
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
                onPress={() => {
                  setLoading(true);
                  setError(null);
                  fetch(API_URL)
                    .then((res) => {
                      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                      return res.json();
                    })
                    .then((data) => setProducts(data))
                    .catch((err: Error) => setError(err.message))
                    .finally(() => setLoading(false));
                }}
                style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
              >
                <ThemedText type="smallBold" style={styles.buyButtonText}>
                  Retry
                </ThemedText>
              </Pressable>
            </View>
          )}

          {/* Products Grid */}
          {!loading && !error && (
            <View style={styles.productsGrid}>
              {products.map((product) => (
                <ThemedView key={product.id} type="backgroundElement" style={styles.card}>
                  <Image
                    source={getImageSource(product.image)}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                  <View style={styles.cardContent}>
                    <View style={styles.categoryRow}>
                      <ThemedText type="small" themeColor="textSecondary" style={styles.categoryText}>
                        {product.category}
                      </ThemedText>
                      <ThemedText type="small" style={styles.ratingText}>
                        {product.rating}
                      </ThemedText>
                    </View>

                    <ThemedText type="smallBold" style={styles.productName}>
                      {product.name}
                    </ThemedText>

                    <ThemedText type="small" themeColor="textSecondary" style={styles.productDescription} numberOfLines={2}>
                      {product.description}
                    </ThemedText>

                    <View style={styles.priceRow}>
                      <ThemedText type="default" style={styles.priceText}>
                        {product.price}
                      </ThemedText>
                      <Pressable style={({ pressed }) => [styles.buyButton, pressed && styles.pressed]}>
                        <ThemedText type="smallBold" style={styles.buyButtonText}>
                          Add to Cart
                        </ThemedText>
                      </Pressable>
                    </View>
                  </View>
                </ThemedView>
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
        width: `calc(100% - ${Spacing.four * 2}px)`,
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
    justifyContent: 'space-between',
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
        width: `calc(33.33% - ${(Spacing.three * 2) / 3}px)`,
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
