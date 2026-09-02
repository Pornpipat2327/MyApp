/**
 * @file order-filters.tsx
 * @description แถบค้นหาและตัวกรองสถานะคำสั่งซื้อ สไตล์ Minecraft Voxel Design System
 * 0px Voxel Doctrine, Dark Border (#3d3938), Search Box (#262423), และ Active Tab (#3c8527)
 */

import React from 'react';
import { StyleSheet, View, TextInput, Pressable, ScrollView } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface OrderFiltersProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  selectedFilter: string;
  onSelectFilter: (filterId: string) => void;
  counts: Record<string, number>;
}

const FILTER_TABS = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'pending', label: 'รอชำระ' },
  { id: 'processing', label: 'เตรียมจัดส่ง' },
  { id: 'shipped', label: 'จัดส่งแล้ว' },
  { id: 'delivered', label: 'สำเร็จ' },
];

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
      <View style={styles.searchBox}>
        <SymbolView
          tintColor={theme.textSecondary}
          name={{ ios: 'magnifyingglass', android: 'search', web: 'search' } as any}
          size={18}
        />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="ค้นหา Order ID, ผู้รับ หรือ เลขพัสดุ..."
          placeholderTextColor="#898481"
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
                  backgroundColor: isActive ? '#3c8527' : '#262423',
                  borderColor: isActive ? '#6cc349' : '#3d3938',
                },
              ]}
            >
              <ThemedText
                type="smallBold"
                style={{
                  color: isActive ? '#ffffff' : '#d0c5c0',
                  fontSize: 12,
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
    borderColor: '#3d3938',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: Spacing.two,
    borderRadius: 0, // 0px voxel doctrine
    backgroundColor: '#262423',
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
    borderRadius: 0, // 0px voxel doctrine
    borderWidth: 1,
  },
});
