/**
 * @file product-toolbar.tsx
 * @description แถบเครื่องมือควบคุมการค้นหาและเรียงลำดับสินค้า (Sort & Filter Toolbar)
 */

import React from 'react';
import { StyleSheet, View, Pressable, ScrollView } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name';

interface ProductToolbarProps {
  totalCount: number;
  inStockOnly: boolean;
  onToggleInStock: () => void;
  ratingFourPlus: boolean;
  onToggleRating: () => void;
  sortOption: SortOption;
  onChangeSort: (opt: SortOption) => void;
  showPriceFilter: boolean;
  onTogglePriceFilter: () => void;
}

export function ProductToolbar({
  totalCount,
  inStockOnly,
  onToggleInStock,
  ratingFourPlus,
  onToggleRating,
  sortOption,
  onChangeSort,
  showPriceFilter,
  onTogglePriceFilter,
}: ProductToolbarProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {/* แถวบน: แสดงจำนวนสินค้า และปุ่มเปิดแผงตัวกรองราคา */}
      <View style={styles.topRow}>
        <ThemedText type="small" themeColor="textSecondary">
          พบสินค้าทั้งหมด <ThemedText type="smallBold">{totalCount}</ThemedText> รายการ
        </ThemedText>

        <Pressable
          onPress={onTogglePriceFilter}
          style={[
            styles.filterToggleBtn,
            {
              backgroundColor: showPriceFilter ? '#6cc349' : theme.backgroundElement,
              borderColor: showPriceFilter ? '#6cc349' : theme.border,
            },
          ]}
        >
          <SymbolView
            tintColor={showPriceFilter ? '#ffffff' : theme.text}
            name={{ ios: 'slider.horizontal.3', android: 'tune', web: 'tune' } as any}
            size={14}
          />
          <ThemedText
            type="small"
            style={{
              color: showPriceFilter ? '#ffffff' : theme.text,
              fontSize: 12,
              fontWeight: '500',
            }}
          >
            ช่วงราคา
          </ThemedText>
        </Pressable>
      </View>

      {/* แถวล่าง: ชิปตัวกรองเร็ว และการเรียงลำดับ */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollChips}
      >
        {/* กรองเฉพาะที่มีสต็อก */}
        <Pressable
          onPress={onToggleInStock}
          style={[
            styles.chip,
            {
              backgroundColor: inStockOnly ? 'rgba(52, 199, 89, 0.15)' : theme.backgroundElement,
              borderColor: inStockOnly ? '#34C759' : theme.border,
            },
          ]}
        >
          <ThemedText
            type="small"
            style={{
              color: inStockOnly ? '#34C759' : theme.text,
              fontSize: 12,
              fontWeight: inStockOnly ? '600' : '400',
            }}
          >
            {inStockOnly ? '✓ พร้อมส่ง' : 'เฉพาะที่มีของ'}
          </ThemedText>
        </Pressable>

        {/* กรองคะแนน 4 ดาวขึ้นไป */}
        <Pressable
          onPress={onToggleRating}
          style={[
            styles.chip,
            {
              backgroundColor: ratingFourPlus ? 'rgba(255, 204, 0, 0.15)' : theme.backgroundElement,
              borderColor: ratingFourPlus ? '#FFCC00' : theme.border,
            },
          ]}
        >
          <ThemedText
            type="small"
            style={{
              color: ratingFourPlus ? '#FF9500' : theme.text,
              fontSize: 12,
              fontWeight: ratingFourPlus ? '600' : '400',
            }}
          >
            {ratingFourPlus ? '✓ ★ 4.0 ขึ้นไป' : '★ 4.0+'}
          </ThemedText>
        </Pressable>

        {/* เรียงตามราคา: ต่ำไปสูง */}
        <Pressable
          onPress={() => onChangeSort(sortOption === 'price-asc' ? 'default' : 'price-asc')}
          style={[
            styles.chip,
            {
              backgroundColor: sortOption === 'price-asc' ? '#007AFF' : theme.backgroundElement,
              borderColor: sortOption === 'price-asc' ? '#007AFF' : theme.border,
            },
          ]}
        >
          <ThemedText
            type="small"
            style={{
              color: sortOption === 'price-asc' ? '#ffffff' : theme.text,
              fontSize: 12,
            }}
          >
            ราคา: ต่ำ → สูง
          </ThemedText>
        </Pressable>

        {/* เรียงตามราคา: สูงไปต่ำ */}
        <Pressable
          onPress={() => onChangeSort(sortOption === 'price-desc' ? 'default' : 'price-desc')}
          style={[
            styles.chip,
            {
              backgroundColor: sortOption === 'price-desc' ? '#007AFF' : theme.backgroundElement,
              borderColor: sortOption === 'price-desc' ? '#007AFF' : theme.border,
            },
          ]}
        >
          <ThemedText
            type="small"
            style={{
              color: sortOption === 'price-desc' ? '#ffffff' : theme.text,
              fontSize: 12,
            }}
          >
            ราคา: สูง → ต่ำ
          </ThemedText>
        </Pressable>

        {/* เรียงตามชื่อ A-Z */}
        <Pressable
          onPress={() => onChangeSort(sortOption === 'name' ? 'default' : 'name')}
          style={[
            styles.chip,
            {
              backgroundColor: sortOption === 'name' ? '#007AFF' : theme.backgroundElement,
              borderColor: sortOption === 'name' ? '#007AFF' : theme.border,
            },
          ]}
        >
          <ThemedText
            type="small"
            style={{
              color: sortOption === 'name' ? '#ffffff' : theme.text,
              fontSize: 12,
            }}
          >
            ชื่อ A-Z
          </ThemedText>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  scrollChips: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
