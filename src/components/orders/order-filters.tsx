/**
 * @file order-filters.tsx
 * @description แถบกรองสถานะคำสั่งซื้อ (Filter Tabs) และช่องค้นหาคำสั่งซื้อ (Search Bar)
 */

import React from 'react';
import { StyleSheet, View, TextInput, Pressable, ScrollView } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface FilterTab {
  id: string;
  label: string;
}

const FILTER_TABS: FilterTab[] = [
  { id: 'all', label: 'ทั้งหมด (All)' },
  { id: 'pending', label: 'รอชำระ' },
  { id: 'processing', label: 'เตรียมจัดส่ง' },
  { id: 'shipped', label: 'จัดส่งแล้ว' },
  { id: 'delivered', label: 'สำเร็จ' },
];

interface OrderFiltersProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  selectedFilter: string;
  onSelectFilter: (filterId: string) => void;
  counts: Record<string, number>;
}

export function OrderFilters({
  searchQuery,
  onSearchChange,
  selectedFilter,
  onSelectFilter,
  counts,
}: OrderFiltersProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {/* ช่องค้นหาคำสั่งซื้อ */}
      <View style={[styles.searchBox, { backgroundColor: theme.background, borderColor: theme.border }]}>
        <SymbolView
          tintColor={theme.textSecondary}
          name={{ ios: 'magnifyingglass', android: 'search', web: 'search' } as any}
          size={16}
        />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="ค้นหาตามเลขที่ออเดอร์, ผู้รับ, หมายเลขพัสดุ..."
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={onSearchChange}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => onSearchChange('')} hitSlop={8}>
            <SymbolView
              tintColor={theme.textSecondary}
              name={{ ios: 'xmark.circle.fill', android: 'cancel', web: 'cancel' } as any}
              size={16}
            />
          </Pressable>
        )}
      </View>

      {/* แถบแท็บสถานะคำสั่งซื้อ */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
      >
        {FILTER_TABS.map((tab) => {
          const isActive = selectedFilter === tab.id;
          const count = counts[tab.id] ?? 0;
          return (
            <Pressable
              key={tab.id}
              onPress={() => onSelectFilter(tab.id)}
              style={[
                styles.tabButton,
                {
                  backgroundColor: isActive ? '#6cc349' : theme.backgroundElement,
                  borderColor: isActive ? '#6cc349' : theme.border,
                },
              ]}
            >
              <ThemedText
                type="smallBold"
                style={{
                  color: isActive ? '#ffffff' : theme.text,
                  fontSize: 13,
                }}
              >
                {tab.label} ({count})
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: Spacing.two,
    borderRadius: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingVertical: 4,
  },
  tabButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
});
