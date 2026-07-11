import React from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Image,
  Pressable,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { TopHeader } from '@/components/top-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  rating: string;
  description: string;
  image: any;
}

const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Nova RGB Mechanical',
    category: 'Gaming',
    price: '$159.00',
    rating: '★ 4.9',
    description: 'Premium hot-swappable mechanical keyboard with per-key RGB, Cherry MX switches, and aircraft-grade aluminum frame.',
    image: require('@/assets/images/keyboard_mechanical_rgb.png'),
  },
  {
    id: '2',
    name: 'Aero 75 Wireless',
    category: 'Wireless',
    price: '$129.00',
    rating: '★ 4.8',
    description: 'Ultra-slim 75% wireless keyboard with Bluetooth 5.1, low-profile keys, and up to 200 hours of battery life.',
    image: require('@/assets/images/keyboard_wireless_white.png'),
  },
  {
    id: '3',
    name: 'Retro Type Classic',
    category: 'Vintage',
    price: '$189.00',
    rating: '★ 4.7',
    description: 'Typewriter-inspired mechanical keyboard with round keycaps, clicky blue switches, and retro pastel aesthetics.',
    image: require('@/assets/images/keyboard_retro_vintage.png'),
  },
  {
    id: '4',
    name: 'Ergo Split Pro',
    category: 'Ergonomic',
    price: '$249.00',
    rating: '★ 4.8',
    description: 'Split ergonomic mechanical keyboard with adjustable tenting, cushioned wrist rests, and programmable macro keys.',
    image: require('@/assets/images/keyboard_ergonomic_split.png'),
  },
  {
    id: '5',
    name: 'Sakura 60 Compact',
    category: 'Compact',
    price: '$99.00',
    rating: '★ 4.6',
    description: 'Adorable 60% compact keyboard with pastel pink and white keycaps, Gateron switches, and USB-C connectivity.',
    image: require('@/assets/images/keyboard_compact_60.png'),
  },
];

export default function ProductScreen() {
  const theme = useTheme();

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

          {/* Section Header */}
          <View style={styles.sectionHeader}>
            <ThemedText type="smallBold" style={styles.sectionTitle}>
              {PRODUCTS.length} Products
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

          {/* Products Grid */}
          <View style={styles.productsGrid}>
            {PRODUCTS.map((product) => (
              <ThemedView key={product.id} type="backgroundElement" style={styles.card}>
                <Image source={product.image} style={styles.productImage} resizeMode="cover" />
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
});
