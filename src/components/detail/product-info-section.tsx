/**
 * @file product-info-section.tsx
 * @description รายละเอียดสินค้าและ Specifications Grid สไตล์ Minecraft Voxel Design System
 * 0px Voxel Doctrine, Dungeons Gold Price (#ffc42b), Specifications 2-Column Grid (#3d3938)
 */

import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface ProductInfoSectionProps {
  name: string;
  category?: string;
  price: number | string;
  rating?: number | string;
  stock?: number;
  location?: string;
  description?: string;
}

export function ProductInfoSection({
  name,
  category = 'General',
  price,
  rating = 4.5,
  stock = 0,
  location,
  description,
}: ProductInfoSectionProps) {
  const theme = useTheme();
  const numericPrice = Number(price) || 0;
  const numericRating = Number(rating) || 4.5;
  const numericStock = Number(stock) || 0;

  return (
    <View style={styles.container}>
      {/* Category & Rating Row */}
      <View style={styles.metaRow}>
        <View style={styles.categoryBadge}>
          <ThemedText style={styles.categoryBadgeText}>{category}</ThemedText>
        </View>
        <View style={styles.ratingBox}>
          <ThemedText style={styles.starText}>★</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={{ marginLeft: 4 }}>
            {numericRating.toFixed(1)} / 5.0
          </ThemedText>
        </View>
      </View>

      {/* Product Name */}
      <ThemedText type="subtitle" style={styles.productName}>
        {name}
      </ThemedText>

      {/* Price */}
      <ThemedText style={styles.priceText}>
        ${numericPrice.toFixed(2)}
      </ThemedText>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: '#3d3938' }]} />

      {/* Specifications Grid */}
      <ThemedText type="smallBold" style={styles.sectionLabel}>
        Specifications
      </ThemedText>
      <View style={styles.specsGrid}>
        <View style={[styles.specItem, { backgroundColor: theme.background }]}>
          <SymbolView
            tintColor="#007AFF"
            name={{ ios: 'tag', android: 'sell', web: 'sell' } as any}
            size={20}
          />
          <ThemedText type="small" themeColor="textSecondary" style={styles.specLabel}>
            Price
          </ThemedText>
          <ThemedText type="smallBold" style={[styles.specValue, { color: '#007AFF' }]}>
            ${numericPrice.toFixed(2)}
          </ThemedText>
        </View>

        <View style={[styles.specItem, { backgroundColor: theme.background }]}>
          <SymbolView
            tintColor="#FF9500"
            name={{ ios: 'square.grid.2x2', android: 'category', web: 'category' } as any}
            size={20}
          />
          <ThemedText type="small" themeColor="textSecondary" style={styles.specLabel}>
            Category
          </ThemedText>
          <ThemedText type="smallBold" style={styles.specValue} numberOfLines={1}>
            {category}
          </ThemedText>
        </View>

        <View style={[styles.specItem, { backgroundColor: theme.background }]}>
          <SymbolView
            tintColor="#ffc42b"
            name={{ ios: 'star.fill', android: 'star', web: 'star' } as any}
            size={20}
          />
          <ThemedText type="small" themeColor="textSecondary" style={styles.specLabel}>
            Rating
          </ThemedText>
          <ThemedText type="smallBold" style={[styles.specValue, { color: '#ffc42b' }]}>
            {numericRating.toFixed(1)} / 5
          </ThemedText>
        </View>

        <View style={[styles.specItem, { backgroundColor: theme.background }]}>
          <SymbolView
            tintColor="#30D158"
            name={{ ios: 'shippingbox', android: 'inventory', web: 'inventory' } as any}
            size={20}
          />
          <ThemedText type="small" themeColor="textSecondary" style={styles.specLabel}>
            Stock
          </ThemedText>
          <ThemedText type="smallBold" style={[styles.specValue, { color: '#30D158' }]}>
            {numericStock} units
          </ThemedText>
        </View>

        {location ? (
          <View style={[styles.specItem, { backgroundColor: theme.background }]}>
            <SymbolView
              tintColor="#AF52DE"
              name={{ ios: 'mappin.circle', android: 'location_on', web: 'location_on' } as any}
              size={20}
            />
            <ThemedText type="small" themeColor="textSecondary" style={styles.specLabel}>
              Location
            </ThemedText>
            <ThemedText type="smallBold" style={[styles.specValue, { color: '#AF52DE' }]} numberOfLines={1}>
              {location}
            </ThemedText>
          </View>
        ) : null}
      </View>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: '#3d3938' }]} />

      {/* Description */}
      <ThemedText type="smallBold" style={styles.sectionLabel}>
        Description
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.descriptionText}>
        {description || 'No description available for this product.'}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
    borderRadius: 0, // 0px voxel doctrine
    borderWidth: 1,
    borderColor: '#6cc349',
    backgroundColor: 'rgba(108, 195, 73, 0.12)',
  },
  categoryBadgeText: {
    color: '#6cc349',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starText: {
    color: '#ffc42b',
    fontSize: 16,
  },
  productName: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
    color: '#ffffff',
  },
  priceText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffc42b', // Dungeons Gold
  },
  divider: {
    height: 1,
    width: '100%',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: '#d0c5c0',
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  specItem: {
    width: '47%',
    ...Platform.select({ web: { width: `calc(50% - ${Spacing.one}px)` as any } }),
    borderRadius: 0, // 0px voxel doctrine
    borderWidth: 1,
    borderColor: '#3d3938',
    padding: Spacing.three,
    gap: 4,
  },
  specLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#d0c5c0',
  },
  specValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#d0c5c0',
  },
});
