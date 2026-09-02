/**
 * @file top-header.tsx
 * @description แถบส่วนหัวด้านบนของระบบ (Global Header Bar)
 * ประกอบด้วยโลโก้ร้านค้า, ช่องค้นหาพร้อมระบบ Auto-complete Popover, ปุ่มสลับธีม, ปุ่มตะกร้าสินค้า และปุ่มผู้ใช้
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, View, TextInput, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCart } from '@/hooks/use-cart';
import { useSearchHistory } from '@/hooks/use-search-history';
import { getProductsApiUrl } from '@/constants/api';
import { QuickProduct } from '@/types/product';
import { SearchDropdown } from '@/components/header/search-dropdown';

export interface TopHeaderProps {
  searchQuery?: string;
  onSearchChange?: (text: string) => void;
  onSearchSubmit?: () => void;
}

export function TopHeader({ searchQuery, onSearchChange, onSearchSubmit }: TopHeaderProps) {
  const theme = useTheme();
  const router = useRouter();
  const { totalItems } = useCart();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [internalQuery, setInternalQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [allProducts, setAllProducts] = useState<QuickProduct[]>([]);
  const [hasFetchedProducts, setHasFetchedProducts] = useState(false);

  const blurTimeoutRef = useRef<any>(null);

  const { recentSearches, popularTags, addSearch, removeSearch, clearSearches } = useSearchHistory();

  // กำหนดว่าใช้ค่าจาก Props หรือ State ภายใน
  const isControlled = onSearchChange !== undefined;
  const activeQuery = isControlled ? (searchQuery ?? '') : internalQuery;

  // ตรวจสอบสถานะการเข้าสู่ระบบ
  useEffect(() => {
    const checkAuth = () => {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const user = localStorage.getItem('user');
        setIsLoggedIn(!!user);
      }
    };

    checkAuth();

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.addEventListener('storage', checkAuth);
      window.addEventListener('auth-change', checkAuth);
      return () => {
        window.removeEventListener('storage', checkAuth);
        window.removeEventListener('auth-change', checkAuth);
      };
    }
  }, []);

  // โหลดรายการสินค้าสำหรับระบบ Auto-complete เมื่อผู้ใช้กดที่ช่องค้นหา
  const loadSuggestions = useCallback(async () => {
    if (hasFetchedProducts) return;
    try {
      const res = await fetch(getProductsApiUrl());
      const json = await res.json();
      const raw = Array.isArray(json) ? json : json.data || [];
      const mapped: QuickProduct[] = raw.map((d: any) => ({
        id: d.id ?? d.Product_ID ?? d.ProductCode,
        name: d.name ?? d.Name ?? '',
        category: d.category ?? d.Category ?? 'General',
        price: d.price ?? d.Price ?? 0,
        image: d.image ?? d.Image ?? d.image_url ?? '',
      }));
      setAllProducts(mapped);
      setHasFetchedProducts(true);
    } catch (e) {
      console.error('Failed to load search suggestions', e);
    }
  }, [hasFetchedProducts]);

  const handleFocus = () => {
    if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    setIsFocused(true);
    loadSuggestions();
  };

  const handleBlur = () => {
    // หน่วงเวลาเล็กน้อยเพื่อให้กดเลือกรายการใน Dropdown ได้ทันก่อนปิด
    blurTimeoutRef.current = setTimeout(() => {
      setIsFocused(false);
    }, 250);
  };

  const handleTextChange = (text: string) => {
    if (isControlled) {
      onSearchChange(text);
    } else {
      setInternalQuery(text);
    }
  };

  const handleQuerySubmit = (queryToSubmit?: string) => {
    const finalQuery = (queryToSubmit !== undefined ? queryToSubmit : activeQuery).trim();
    if (!finalQuery) return;

    addSearch(finalQuery);
    setIsFocused(false);

    if (onSearchSubmit) {
      onSearchSubmit();
    } else {
      router.push({
        pathname: '/product' as any,
        params: { search: finalQuery },
      });
    }
  };

  const handleSelectProduct = (product: QuickProduct) => {
    setIsFocused(false);
    router.push({
      pathname: '/detail' as any,
      params: { id: String(product.id) },
    });
  };

  // กรองสินค้าที่ตรงกับคำค้นหา
  const matchingProducts = React.useMemo(() => {
    if (!activeQuery.trim()) return [];
    const q = activeQuery.toLowerCase().trim();
    return allProducts
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.category && p.category.toLowerCase().includes(q))
      )
      .slice(0, 5);
  }, [activeQuery, allProducts]);

  return (
    <ThemedView type="background" style={styles.headerWrapper}>
      <View style={styles.innerContainer}>
        {/* ส่วนโลโก้ร้านค้า */}
        <Pressable onPress={() => router.push('/' as any)} style={styles.logoButton}>
          <ThemedText style={styles.logoIcon}>⌨️</ThemedText>
          <ThemedText type="smallBold" style={styles.logoTitle}>
            Extreme<ThemedText type="smallBold" style={{ color: '#6cc349' }}>Key</ThemedText>
          </ThemedText>
        </Pressable>

        {/* ช่องค้นหาพร้อม Dropdown */}
        <View style={styles.searchSection}>
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: isFocused ? '#6cc349' : theme.border,
              },
            ]}
          >
            <SymbolView
              tintColor={theme.textSecondary}
              name={{ ios: 'magnifyingglass', android: 'search', web: 'search' } as any}
              size={18}
            />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="ค้นหาคีย์บอร์ด, หมวดหมู่, สเปก..."
              placeholderTextColor={theme.textSecondary}
              value={activeQuery}
              onChangeText={handleTextChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onSubmitEditing={() => handleQuerySubmit()}
              returnKeyType="search"
            />
            {activeQuery.length > 0 && (
              <Pressable onPress={() => handleTextChange('')} hitSlop={8}>
                <SymbolView
                  tintColor={theme.textSecondary}
                  name={{ ios: 'xmark.circle.fill', android: 'cancel', web: 'cancel' } as any}
                  size={16}
                />
              </Pressable>
            )}
          </View>

          {/* ป๊อปอัปผลการค้นหา */}
          {isFocused && (
            <SearchDropdown
              activeQuery={activeQuery}
              recentSearches={recentSearches}
              popularTags={popularTags}
              matchingProducts={matchingProducts}
              onSelectQuery={handleQuerySubmit}
              onSelectProduct={handleSelectProduct}
              onRemoveSearchItem={removeSearch}
              onClearSearches={clearSearches}
              onClose={() => setIsFocused(false)}
            />
          )}
        </View>

        {/* ไอคอนด้านขวา: ตะกร้าสินค้า และ ผู้ใช้ */}
        <View style={styles.actionsRight}>
          {/* ปุ่มตะกร้าสินค้า */}
          <Pressable
            onPress={() => router.push('/cart' as any)}
            style={({ pressed }) => [
              styles.actionIconButton,
              { backgroundColor: theme.backgroundElement },
              pressed && styles.pressed,
            ]}
          >
            <SymbolView
              tintColor={theme.text}
              name={{ ios: 'cart', android: 'shopping_cart', web: 'shopping_cart' } as any}
              size={20}
            />
            {totalItems > 0 && (
              <View style={styles.badge}>
                <ThemedText type="smallBold" style={styles.badgeText}>
                  {totalItems > 99 ? '99+' : totalItems}
                </ThemedText>
              </View>
            )}
          </Pressable>

          {/* ปุ่มโปรไฟล์/ล็อกอิน */}
          <Pressable
            onPress={() => router.push('/login' as any)}
            style={({ pressed }) => [
              styles.actionIconButton,
              { backgroundColor: theme.backgroundElement },
              pressed && styles.pressed,
            ]}
          >
            <SymbolView
              tintColor={isLoggedIn ? '#6cc349' : theme.text}
              name={{
                ios: isLoggedIn ? 'person.fill.checkmark' : 'person.circle',
                android: 'account_circle',
                web: 'account_circle',
              } as any}
              size={20}
            />
          </Pressable>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  headerWrapper: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.15)',
    zIndex: 999,
  },
  innerContainer: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  logoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoIcon: {
    fontSize: 24,
  },
  logoTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  searchSection: {
    flex: 1,
    position: 'relative',
    zIndex: 1000,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: Spacing.three,
    height: 40,
    gap: Spacing.two,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  actionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  actionIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#6cc349',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  pressed: {
    opacity: 0.7,
  },
});
