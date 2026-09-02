/**
 * @file cart-item-row.tsx
 * @description คอมโพเนนต์แสดงแถวสินค้าในตะกร้า พร้อมปุ่มเพิ่ม/ลดจำนวน และปุ่มลบสินค้า
 */

import React from 'react';
import { StyleSheet, View, Image, Pressable } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { CartItem } from '@/hooks/use-cart';
import { getImageSource } from '@/utils/image';

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (id: string | number, qty: number) => void;
  onRemove: (id: string | number) => void;
}

export function CartItemRow({ item, onUpdateQuantity, onRemove }: CartItemRowProps) {
  const theme = useTheme();
  const imgSrc = getImageSource(item.image);
  const maxStock = item.stock ?? 99;

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      {/* ภาพตัวอย่างสินค้า */}
      <View style={styles.imageWrapper}>
        {imgSrc ? (
          <Image source={imgSrc} style={styles.itemImage} resizeMode="cover" />
        ) : (
          <View style={[styles.placeholderImage, { backgroundColor: theme.background }]}>
            <SymbolView
              tintColor={theme.textSecondary}
              name={{ ios: 'keyboard', android: 'keyboard', web: 'keyboard' } as any}
              size={32}
            />
          </View>
        )}
      </View>

      {/* รายละเอียดสินค้า */}
      <View style={styles.detailsCol}>
        <View style={styles.titleRow}>
          <ThemedText type="smallBold" numberOfLines={1} style={styles.productName}>
            {item.name}
          </ThemedText>
          <Pressable
            onPress={() => onRemove(item.id)}
            hitSlop={8}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <SymbolView
              tintColor="#FF3B30"
              name={{ ios: 'trash', android: 'delete', web: 'delete' } as any}
              size={18}
            />
          </Pressable>
        </View>

        <ThemedText type="small" themeColor="textSecondary">
          หมวดหมู่: {item.category || 'General'}
        </ThemedText>

        <View style={styles.bottomRow}>
          <ThemedText type="smallBold" style={styles.priceText}>
            ${Number(item.price).toFixed(2)}
          </ThemedText>

          {/* แถบปรับจำนวน */}
          <View style={[styles.stepperContainer, { borderColor: theme.border }]}>
            <Pressable
              onPress={() => onUpdateQuantity(item.id, item.quantity - 1)}
              style={({ pressed }) => [styles.stepperBtn, pressed && styles.pressed]}
            >
              <ThemedText style={styles.stepperSymbol}>-</ThemedText>
            </Pressable>

            <ThemedText type="smallBold" style={styles.quantityText}>
              {item.quantity}
            </ThemedText>

            <Pressable
              onPress={() => onUpdateQuantity(item.id, Math.min(maxStock, item.quantity + 1))}
              disabled={item.quantity >= maxStock}
              style={({ pressed }) => [
                styles.stepperBtn,
                item.quantity >= maxStock && { opacity: 0.3 },
                pressed && styles.pressed,
              ]}
            >
              <ThemedText style={styles.stepperSymbol}>+</ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: Spacing.three,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.15)',
    gap: Spacing.three,
    alignItems: 'center',
  },
  imageWrapper: {
    width: 72,
    height: 72,
    borderRadius: 6,
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsCol: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productName: {
    fontSize: 15,
    flex: 1,
    paddingRight: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  priceText: {
    color: '#6cc349',
    fontSize: 16,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 4,
    overflow: 'hidden',
  },
  stepperBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantityText: {
    paddingHorizontal: 8,
    fontSize: 13,
  },
  pressed: {
    opacity: 0.6,
  },
});
