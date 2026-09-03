/**
 * @file categories.tsx
 * @description หน้าจอหมวดหมู่สินค้าทั้งหมด (Categories Screen)
 * คำนวณและแสดงจำนวนสินค้าในแต่ละหมวดหมู่แบบ Dynamic จาก MySQL Database
 */

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TopHeader } from '@/components/top-header';
import { getProductsApiUrl } from '@/constants/api';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { ProductCategory } from '@/types/product';
import { DEFAULT_CATEGORIES } from '@/constants/categories';
import { getStorageItem } from '@/utils/storage';

export default function CategoriesScreen() {
  const router = useRouter();
  const [categoriesList, setCategoriesList] = useState<ProductCategory[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getStorageItem('user');
    if (!user) {
      router.replace('/login' as any);
    }

    let isMounted = true;
    fetch(getProductsApiUrl())
      .then((res) => res.json())
      .then((json) => {
        if (!isMounted) return;
        const rawData = Array.isArray(json) ? json : json.data || [];

        const counts: Record<string, number> = {};
        rawData.forEach((p: any) => {
          const catName = p.category ?? p.Category ?? 'Other';
          counts[catName] = (counts[catName] || 0) + 1;
        });

        const updatedCategories: ProductCategory[] = [];
        let idCounter = 1;

        for (const [name, count] of Object.entries(counts)) {
          const existing = DEFAULT_CATEGORIES.find(
            (c) => c.name.toLowerCase() === name.toLowerCase()
          );
          updatedCategories.push({
            id: String(idCounter++),
            name: existing ? existing.name : name,
            icon: existing
              ? existing.icon
              : { ios: 'square.grid.2x2.fill', android: 'category', web: 'category' },
            color: existing ? existing.color : '#888888',
            count,
          });
        }

        if (updatedCategories.length > 0) {
          setCategoriesList(updatedCategories);
        }
      })
      .catch((error) => {
        console.error('Failed to fetch product categories', error);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleSelectCategory = (cat: ProductCategory) => {
    router.push({
      pathname: '/product' as any,
      params: { category: cat.name },
    });
  };

  return (
    <ThemedView type="background" style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <TopHeader />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ส่วนหัวข้อ */}
          <View style={styles.titleSection}>
            <ThemedText type="subtitle" style={styles.headerTitle}>
              หมวดหมู่สินค้า (Categories)
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              ค้นหาและเลือกดูคีย์บอร์ดตามประเภทที่คุณชื่นชอบ
            </ThemedText>
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#6cc349" />
              <ThemedText type="small" themeColor="textSecondary" style={{ marginTop: 12 }}>
                กำลังอัปเดตจำนวนสินค้าในหมวดหมู่...
              </ThemedText>
            </View>
          ) : (
            /* ตาราง Grid หมวดหมู่ */
            <View style={styles.grid}>
              {categoriesList.map((cat) => (
                <Pressable
                  key={cat.id}
                  onPress={() => handleSelectCategory(cat)}
                  style={({ pressed }) => [styles.categoryCardWrapper, pressed && styles.pressed]}
                >
                  <ThemedView type="backgroundElement" style={styles.categoryCard}>
                    <View style={[styles.iconCircle, { backgroundColor: cat.color }]}>
                      <SymbolView
                        tintColor="#ffffff"
                        name={cat.icon as any}
                        size={28}
                      />
                    </View>
                    <ThemedText type="smallBold" style={styles.categoryName}>
                      {cat.name}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {cat.count} รายการ
                    </ThemedText>
                  </ThemedView>
                </Pressable>
              ))}
            </View>
          )}
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
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
    padding: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.six,
    gap: Spacing.four,
  },
  titleSection: {
    gap: 4,
  },
  headerTitle: {
    fontSize: 22,
  },
  loadingBox: {
    paddingVertical: Spacing.six,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  categoryCardWrapper: {
    width: '50%',
    padding: 6,
    minWidth: 150,
  },
  categoryCard: {
    padding: Spacing.four,
    borderRadius: 0, // 0px voxel doctrine
    borderWidth: 1,
    borderColor: '#3d3938',
    alignItems: 'center',
    gap: Spacing.two,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 0, // 0px voxel doctrine
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 16,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
