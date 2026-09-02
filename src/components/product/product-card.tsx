/**
 * @file product-card.tsx
 * @description การ์ดแสดงผลสินค้าในรูปแบบ Grid ของหน้ารายการสินค้า (Product List)
 */

import React from 'react';
import { StyleSheet, View, Image, Pressable } from 'react-native';
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

export function ProductCard({ product, onPress, onAddToCart }: ProductCardProps) {
  const theme = useTheme();
  const imgSrc = getImageSource(product.image);

  const priceNum = Number(product.price) || 0;
  const ratingNum = Number(product.rating) || 4.5;
  const stockNum = Number(product.stock) || 0;
  const isOutOfStock = stockNum <= 0;

  return (
    <Pressable
      onPress={() => onPress(product)}
      style={({ pressed }) => [styles.cardWrapper, pressed && styles.pressed]}
    >
      <ThemedView type="backgroundElement" style={styles.card}>
        {/* รูปภาพสินค้า */}
        <View style={[styles.imageBox, { backgroundColor: theme.background }]}>
          {imgSrc ? (
            <Image source={imgSrc} style={styles.image} resizeMode="contain" />
          ) : (
            <SymbolView
              tintColor={theme.textSecondary}
              name={{ ios: 'keyboard', android: 'keyboard', web: 'keyboard' } as any}
              size={48}
            />
          )}

          {/* ป้ายหมวดหมู่ */}
          {product.category && (
            <View style={styles.categoryBadge}>
              <ThemedText style={styles.categoryText}>{product.category}</ThemedText>
            </View>
          )}

          {/* ป้ายสต็อก */}
          {isOutOfStock && (
            <View style={styles.outOfStockBadge}>
              <ThemedText style={styles.outOfStockText}>หมด</ThemedText>
            </View>
          )}
        </View>

        {/* ข้อมูลสินค้า */}
        <View style={styles.contentBox}>
          <ThemedText type="smallBold" numberOfLines={2} style={styles.title}>
            {product.name}
          </ThemedText>

          {/* คะแนนและตำแหน่ง */}
          <View style={styles.metaRow}>
            <View style={styles.ratingRow}>
              <ThemedText style={styles.star}>★</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {ratingNum.toFixed(1)}
              </ThemedText>
            </View>
            {product.location ? (
              <ThemedText type="small" themeColor="textSecondary" numberOfLines={1} style={{ maxWidth: '60%' }}>
                📍 {product.location}
              </ThemedText>
            ) : null}
          </View>

          {/* แถวล่าง: ราคา และ ปุ่มเพิ่มลงตะกร้า */}
          <View style={styles.footerRow}>
            <ThemedText type="smallBold" style={styles.priceText}>
              ${priceNum.toFixed(2)}
            </ThemedText>

            {onAddToCart && (
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  if (!isOutOfStock) onAddToCart(product);
                }}
                disabled={isOutOfStock}
                style={({ pressed }) => [
                  styles.quickAddBtn,
                  { backgroundColor: isOutOfStock ? theme.border : '#6cc349' },
                  pressed && { opacity: 0.7 },
                ]}
                hitSlop={6}
              >
                <SymbolView
                  tintColor="#ffffff"
                  name={{ ios: 'plus', android: 'add', web: 'add' } as any}
                  size={16}
                />
              </Pressable>
            )}
          </View>
        </View>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    flex: 1,
    minWidth: 160,
    maxWidth: '50%',
    padding: 6,
  },
  card: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.15)',
    overflow: 'hidden',
    height: '100%',
    justifyContent: 'space-between',
  },
  imageBox: {
    width: '100%',
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  image: {
    width: '85%',
    height: '85%',
  },
  categoryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  outOfStockBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  outOfStockText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  contentBox: {
    padding: Spacing.two,
    gap: 4,
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 13,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  star: {
    color: '#FFCC00',
    fontSize: 12,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  priceText: {
    color: '#6cc349',
    fontSize: 16,
  },
  quickAddBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
});
