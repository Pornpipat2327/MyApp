import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
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

interface Category {
  id: string;
  name: string;
  icon: { ios: string; android: string; web: string };
  count: number;
  color: string;
}

const CATEGORIES: Category[] = [
  {
    id: '1',
    name: 'Gaming',
    icon: { ios: 'gamecontroller.fill', android: 'stadia_controller', web: 'stadia_controller' },
    count: 24,
    color: '#E53935',
  },
  {
    id: '2',
    name: 'Wireless',
    icon: { ios: 'antenna.radiowaves.left.and.right', android: 'bluetooth_connected', web: 'bluetooth_connected' },
    count: 18,
    color: '#1E88E5',
  },
  {
    id: '3',
    name: 'Vintage',
    icon: { ios: 'calendar.badge.clock', android: 'auto_awesome', web: 'auto_awesome' },
    count: 12,
    color: '#8E24AA',
  },
  {
    id: '4',
    name: 'Ergonomic',
    icon: { ios: 'figure.mind.and.body', android: 'accessibility_new', web: 'accessibility_new' },
    count: 15,
    color: '#43A047',
  },
  {
    id: '5',
    name: 'Compact',
    icon: { ios: 'square.resize.down', android: 'aspect_ratio', web: 'aspect_ratio' },
    count: 20,
    color: '#FB8C00',
  },
  {
    id: '6',
    name: 'Mechanical',
    icon: { ios: 'keyboard.fill', android: 'keyboard_alt', web: 'keyboard_alt' },
    count: 32,
    color: '#5C6BC0',
  },
];

export default function CategoriesScreen() {
  const theme = useTheme();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <ThemedView type="background" style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <TopHeader />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Page Header */}
          <View style={styles.pageHeader}>
            <ThemedText type="subtitle" style={styles.pageTitle}>
              Categories
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.pageSubtitle}>
              Browse products by category to find exactly what you need.
            </ThemedText>
          </View>

          {/* Category Cards Grid */}
          <View style={styles.grid}>
            {CATEGORIES.map((cat) => {
              const isSelected = selectedId === cat.id;
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => setSelectedId(isSelected ? null : cat.id)}
                  style={({ pressed }) => [pressed && styles.pressed]}
                >
                  <ThemedView
                    type={isSelected ? 'backgroundSelected' : 'backgroundElement'}
                    style={[
                      styles.categoryCard,
                      isSelected && { borderColor: cat.color, borderWidth: 2 },
                    ]}
                  >
                    {/* Icon Circle */}
                    <View style={[styles.iconCircle, { backgroundColor: cat.color + '20' }]}>
                      <SymbolView
                        tintColor={cat.color}
                        name={cat.icon}
                        size={24}
                      />
                    </View>

                    {/* Category Info */}
                    <View style={styles.categoryInfo}>
                      <ThemedText type="smallBold" style={styles.categoryName}>
                        {cat.name}
                      </ThemedText>
                      <ThemedText type="small" themeColor="textSecondary" style={styles.categoryCount}>
                        {cat.count} products
                      </ThemedText>
                    </View>

                    {/* Arrow */}
                    <SymbolView
                      tintColor={theme.textSecondary}
                      name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
                      size={16}
                    />
                  </ThemedView>
                </Pressable>
              );
            })}
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <ThemedView type="backgroundElement" style={styles.statCard}>
              <ThemedText type="subtitle" style={styles.statNumber}>
                {CATEGORIES.length}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Categories
              </ThemedText>
            </ThemedView>
            <ThemedView type="backgroundElement" style={styles.statCard}>
              <ThemedText type="subtitle" style={styles.statNumber}>
                {CATEGORIES.reduce((sum, c) => sum + c.count, 0)}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Total Products
              </ThemedText>
            </ThemedView>
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
  pageHeader: {
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.four,
    gap: Spacing.two,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
  },
  pageSubtitle: {
    maxWidth: 500,
  },
  grid: {
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Spacing.four,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryInfo: {
    flex: 1,
    gap: 2,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '700',
  },
  categoryCount: {
    fontSize: 13,
  },
  pressed: {
    opacity: 0.8,
  },
  statsRow: {
    width: '100%',
    maxWidth: MaxContentWidth,
    flexDirection: 'row',
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
    marginTop: Spacing.five,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    borderRadius: Spacing.four,
    paddingVertical: Spacing.four,
    gap: Spacing.one,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '800',
  },
});
