/**
 * @file product-card.tsx
 * @description การ์ดแสดงผลสินค้าในรูปแบบ Grid สไตล์ Minecraft Voxel Design System
 * 0px Voxel Doctrine, Dark Border (#3d3938), Category Accent (#6cc349), และ Rating Accent (#ffc42b)
 */

import React from 'react';
import { StyleSheet, View, Image, Pressable, Platform } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Product } from '@/types/product';
import { getImageSource } from '@/utils/image';

interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
}

export function ProductCard({ product, onPress }: ProductCardProps) {
  const theme = useTheme();
  const imgSrc = getImageSource(product.image);
  const priceNum = Number(product.price) || 0;
  const ratingNum = Number(product.rating) || 4.5;

  return (
    <Pressable
      onPress={() => onPress(product)}
      style={({ pressed }) => [styles.cardPressable, { opacity: pressed ? 0.88 : 1 }]}
    >
      <ThemedView type="backgroundElement" style={styles.card}>
        {/* รูปภาพสินค้า */}
        {imgSrc ? (
          <Image source={imgSrc} style={styles.productImage} resizeMode="cover" />
        ) : (
          <View style={[styles.productImage, styles.placeholderBox]}>
            <SymbolView
              name={{ ios: 'keyboard', android: 'keyboard', web: 'keyboard' }}
              tintColor={theme.textSecondary}
              size={48}
            />
          </View>
        )}

        {/* ข้อมูลสินค้า */}
        <View style={styles.cardContent}>
          <View style={styles.categoryRow}>
            <ThemedText type="small" style={styles.categoryText}>
              {product.category || 'General'}
            </ThemedText>
            <ThemedText type="small" style={styles.ratingText}>
              ★ {ratingNum.toFixed(1)}
            </ThemedText>
          </View>

          <ThemedText type="smallBold" style={styles.productName} numberOfLines={2}>
            {product.name}
          </ThemedText>

          <View style={styles.priceRow}>
            <ThemedText type="default" style={styles.priceText}>
              ${priceNum.toFixed(2)}
            </ThemedText>
          </View>
        </View>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
    borderRadius: 0, // 0px voxel doctrine
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
  placeholderBox: {
    alignItems: 'center',
    justifyContent: 'center',
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
});
