/**
 * @file search-dropdown.tsx
 * @description กล่องแสดงผลลัพธ์การค้นหาอัตโนมัติ (Search Autocomplete Popover)
 * ประกอบด้วยประวัติการค้นหาล่าสุด แท็กหมวดหมู่ยอดนิยม และรายการสินค้าที่ตรงกับคำค้นหา
 */

import React from 'react';
import { StyleSheet, View, Pressable, Image, ScrollView } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { QuickProduct } from '@/types/product';
import { getImageSource } from '@/utils/image';

interface SearchDropdownProps {
  activeQuery: string;
  recentSearches: string[];
  popularTags: string[];
  matchingProducts: QuickProduct[];
  onSelectQuery: (query: string) => void;
  onSelectProduct: (product: QuickProduct) => void;
  onRemoveSearchItem: (query: string) => void;
  onClearSearches: () => void;
  onClose: () => void;
}

export function SearchDropdown({
  activeQuery,
  recentSearches,
  popularTags,
  matchingProducts,
  onSelectQuery,
  onSelectProduct,
  onRemoveSearchItem,
  onClearSearches,
  onClose,
}: SearchDropdownProps) {
  const theme = useTheme();

  return (
    <ThemedView
      type="backgroundElement"
      style={[styles.dropdownContainer, { borderColor: theme.border }]}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* กรณีที่ 1: ผู้ใช้ยังไม่ได้พิมพ์คำค้นหา ให้แสดงประวัติและแท็กยอดนิยม */}
        {!activeQuery.trim() ? (
          <>
            {/* ประวัติการค้นหาล่าสุด */}
            {recentSearches.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <ThemedText type="smallBold" style={styles.sectionTitle}>
                    🕒 ค้นหาล่าสุด (Recent Searches)
                  </ThemedText>
                  <Pressable onPress={onClearSearches} hitSlop={8}>
                    <ThemedText type="small" style={{ color: '#FF3B30', fontSize: 12 }}>
                      ล้างทั้งหมด
                    </ThemedText>
                  </Pressable>
                </View>

                <View style={styles.chipsRow}>
                  {recentSearches.map((item) => (
                    <View
                      key={item}
                      style={[styles.historyChip, { backgroundColor: theme.background, borderColor: theme.border }]}
                    >
                      <Pressable onPress={() => onSelectQuery(item)}>
                        <ThemedText type="small" numberOfLines={1}>
                          {item}
                        </ThemedText>
                      </Pressable>
                      <Pressable onPress={() => onRemoveSearchItem(item)} hitSlop={6}>
                        <SymbolView
                          tintColor={theme.textSecondary}
                          name={{ ios: 'xmark', android: 'close', web: 'close' } as any}
                          size={12}
                        />
                      </Pressable>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* แท็กหมวดหมู่ยอดนิยม */}
            <View style={styles.section}>
              <ThemedText type="smallBold" style={styles.sectionTitle}>
                🔥 หมวดหมู่ยอดนิยม
              </ThemedText>
              <View style={styles.chipsRow}>
                {popularTags.map((tag) => (
                  <Pressable
                    key={tag}
                    onPress={() => onSelectQuery(tag)}
                    style={[
                      styles.popularChip,
                      { backgroundColor: theme.background, borderColor: theme.border },
                    ]}
                  >
                    <ThemedText type="small" style={{ color: '#6cc349', fontWeight: '500' }}>
                      #{tag}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>
          </>
        ) : (
          /* กรณีที่ 2: มีการพิมพ์คำค้นหา ให้แสดงสินค้าที่ตรงกัน */
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <ThemedText type="smallBold" style={styles.sectionTitle}>
                ผลการค้นหาสำหรับ &quot;{activeQuery}&quot;
              </ThemedText>
              <Pressable onPress={() => onSelectQuery(activeQuery)}>
                <ThemedText type="small" style={{ color: '#007AFF', fontSize: 12 }}>
                  ดูทั้งหมด →
                </ThemedText>
              </Pressable>
            </View>

            {matchingProducts.length === 0 ? (
              <View style={styles.emptyState}>
                <ThemedText type="small" themeColor="textSecondary">
                  ไม่พบคีย์บอร์ดที่ตรงกับ &quot;{activeQuery}&quot;
                </ThemedText>
              </View>
            ) : (
              <View style={styles.productsList}>
                {matchingProducts.map((p) => {
                  const imgSrc = getImageSource(p.image);
                  return (
                    <Pressable
                      key={p.id}
                      onPress={() => onSelectProduct(p)}
                      style={({ pressed }) => [
                        styles.productItemRow,
                        { borderBottomColor: theme.border },
                        pressed && { backgroundColor: 'rgba(128, 128, 128, 0.08)' },
                      ]}
                    >
                      <View style={styles.productThumbBox}>
                        {imgSrc ? (
                          <Image source={imgSrc} style={styles.productThumb} resizeMode="cover" />
                        ) : (
                          <View style={[styles.productThumb, { backgroundColor: theme.background }]} />
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <ThemedText type="smallBold" numberOfLines={1}>
                          {p.name}
                        </ThemedText>
                        <ThemedText type="small" themeColor="textSecondary">
                          {p.category || 'General'}
                        </ThemedText>
                      </View>
                      <ThemedText type="smallBold" style={{ color: '#6cc349' }}>
                        ${Number(p.price).toFixed(2)}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  dropdownContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 6,
    borderRadius: 0, // 0px voxel doctrine
    borderWidth: 1,
    borderColor: '#3d3938',
    maxHeight: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1000,
    overflow: 'hidden',
  },
  scrollContent: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  section: {
    gap: Spacing.two,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: '#d0c5c0',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  historyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 0, // 0px voxel doctrine
    borderWidth: 1,
    borderColor: '#3d3938',
    backgroundColor: '#262423',
  },
  popularChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 0, // 0px voxel doctrine
    borderWidth: 1,
    borderColor: '#3d3938',
    backgroundColor: '#262423',
  },
  productsList: {
    gap: 4,
  },
  productItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#3d3938',
  },
  productThumbBox: {
    width: 36,
    height: 36,
    borderRadius: 0, // 0px voxel doctrine
    overflow: 'hidden',
  },
  productThumb: {
    width: '100%',
    height: '100%',
  },
  emptyState: {
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
});
