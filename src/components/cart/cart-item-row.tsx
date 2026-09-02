/**
 * @file cart-item-row.tsx
 * @description คอมโพเนนต์แสดงแถวสินค้าในตะกร้า สไตล์ Minecraft Voxel Design System
 * 0px Voxel Doctrine, Dark Border (#3d3938), Category Accent (#6cc349), และ Stepper คมชัด 0px
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
          <View style={{ flex: 1, paddingRight: 8 }}>
            <ThemedText type="small" style={styles.itemCategory}>
              {item.category || 'General'}
            </ThemedText>
            <ThemedText type="smallBold" numberOfLines={1} style={styles.productName}>
              {item.name}
            </ThemedText>
          </View>
          <Pressable
            onPress={() => onRemove(item.id)}
            hitSlop={8}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <SymbolView
              tintColor="#ff605e"
              name={{ ios: 'trash', android: 'delete', web: 'delete' } as any}
              size={18}
            />
          </Pressable>
        </View>

        <View style={styles.bottomRow}>
          <ThemedText type="smallBold" style={styles.priceText}>
            ${Number(item.price).toFixed(2)}
          </ThemedText>

          {/* Stepper ปุ่มเพิ่ม/ลดจำนวน */}
          <View style={styles.stepperContainer}>
            <Pressable
              onPress={() => onUpdateQuantity(item.id, item.quantity - 1)}
              style={({ pressed }) => [
                styles.stepperBtn,
                { backgroundColor: theme.backgroundSelected },
                pressed && styles.pressed,
              ]}
            >
              <ThemedText style={styles.stepperSymbol}>-</ThemedText>
            </Pressable>

            <ThemedText type="smallBold" style={styles.quantityText}>
              {item.quantity}
            </ThemedText>

            <Pressable
              onPress={() => onUpdateQuantity(item.id, item.quantity + 1)}
              disabled={item.quantity >= maxStock}
              style={({ pressed }) => [
                styles.stepperBtn,
                { backgroundColor: theme.backgroundSelected },
                (pressed || item.quantity >= maxStock) && styles.pressed,
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
    borderRadius: 0, // 0px voxel doctrine
    borderWidth: 1,
    borderColor: '#3d3938',
    gap: Spacing.three,
    alignItems: 'center',
  },
  imageWrapper: {
    width: 84,
    height: 84,
    borderRadius: 0, // 0px voxel doctrine
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
  itemCategory: {
    fontSize: 11,
    color: '#6cc349',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  productName: {
    fontSize: 15,
    marginTop: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  priceText: {
    color: '#6cc349',
    fontSize: 16,
    fontWeight: '800',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3d3938',
    borderRadius: 0, // 0px voxel doctrine
    overflow: 'hidden',
  },
  stepperBtn: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    minWidth: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantityText: {
    paddingHorizontal: Spacing.two,
    fontSize: 14,
    fontWeight: '700',
    minWidth: 24,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
