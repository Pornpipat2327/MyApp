/**
 * @file top-header.tsx
 * @description แถบส่วนหัวด้านบนของระบบ (Global Header Bar)
 * ประกอบด้วยโลโก้ร้านค้า, ช่องค้นหาพร้อมระบบ Auto-complete Popover, ปุ่มสลับธีม, ปุ่มตะกร้าสินค้า และปุ่มผู้ใช้
 * ออกแบบ Responsive เต็มรูปแบบ: บนจอมือถือ (<680px) แยกเป็น 2 แถวเพื่อไม่ให้ไอคอนและช่องค้นหาทับกัน
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, View, TextInput, Pressable, Platform, useWindowDimensions } from 'react-native';
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
import { isCurrentUserAdmin, getStorageItem, subscribeStorageChange } from '@/utils/storage';

export interface TopHeaderProps {
  searchQuery?: string;
  onSearchChange?: (text: string) => void;
  onSearchSubmit?: () => void;
}

export function TopHeader({ searchQuery, onSearchChange, onSearchSubmit }: TopHeaderProps) {
  const theme = useTheme();
  const router = useRouter();
  const { totalItems } = useCart();
  const { width } = useWindowDimensions();
  const isMobile = width < 680;

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return !!getStorageItem('user');
  });
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return isCurrentUserAdmin();
  });
  const [internalQuery, setInternalQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [allProducts, setAllProducts] = useState<QuickProduct[]>([]);
  const [hasFetchedProducts, setHasFetchedProducts] = useState(false);

  const blurTimeoutRef = useRef<any>(null);

  const { recentSearches, popularTags, addSearch, removeSearch, clearSearches } = useSearchHistory();

  // กำหนดว่าใช้ค่าจาก Props หรือ State ภายใน
  const isControlled = onSearchChange !== undefined;
  const activeQuery = isControlled ? (searchQuery ?? '') : internalQuery;

  // ตรวจสอบสถานะการเข้าสู่ระบบและสิทธิ์ Admin (ทำงานทั้งบน Mobile และ Web)
  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(!!getStorageItem('user'));
      setIsAdmin(isCurrentUserAdmin());
    };

    checkAuth();

    // ดักฟังเหตุการณ์ auth-change ผ่าน Universal Event Emitter
    const unsub = subscribeStorageChange('auth-change', checkAuth);
    return unsub;
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

  // คอมโพเนนต์ช่องค้นหา
  const renderSearchBar = () => (
    <View style={[styles.searchSection, isMobile && styles.searchSectionMobile]}>
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
  );

  // คอมโพเนนต์ปุ่มการทำงานด้านขวา (Orders, Cart, User)
  const renderActionButtons = () => (
    <View style={styles.actionsRight}>
      {/* ปุ่ม Orders (แสดงสำหรับทุกคน: Admin จัดการออเดอร์, User ดูประวัติการสั่งซื้อ) */}
      <Pressable
        onPress={() => router.push('/orders' as any)}
        accessibilityLabel={isAdmin ? 'Manage Orders' : 'My Orders'}
        {...(Platform.OS === 'web' ? ({ title: isAdmin ? 'Manage Orders' : 'My Orders' } as any) : {})}
        style={({ pressed }) => [
          styles.actionIconButton,
          {
            backgroundColor: theme.backgroundElement,
            borderColor: isAdmin ? '#6cc349' : '#3d3938',
          },
          pressed && styles.pressed,
        ]}
      >
        <SymbolView
          tintColor={isAdmin ? '#6cc349' : theme.text}
          name={{ ios: 'doc.plaintext', android: 'receipt_long', web: 'receipt_long' } as any}
          size={18}
        />
      </Pressable>

      {/* ปุ่มตะกร้าสินค้า */}
      <Pressable
        onPress={() => router.push('/cart' as any)}
        accessibilityLabel="Cart"
        style={({ pressed }) => [
          styles.actionIconButton,
          { backgroundColor: theme.backgroundElement },
          pressed && styles.pressed,
        ]}
      >
        <SymbolView
          tintColor={theme.text}
          name={{ ios: 'cart', android: 'shopping_cart', web: 'shopping_cart' } as any}
          size={18}
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
        accessibilityLabel="Account"
        style={({ pressed }) => [
          styles.actionIconButton,
          {
            backgroundColor: theme.backgroundElement,
            borderColor: isLoggedIn ? '#6cc349' : '#3d3938',
          },
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
          size={18}
        />
      </Pressable>
    </View>
  );

  return (
    <ThemedView type="background" style={styles.headerWrapper}>
      {isMobile ? (
        /* โหมดมือถือ: จัด 2 แถว (แถว 1: โลโก้ + ปุ่มคำสั่ง, แถว 2: ช่องค้นหาเต็มความกว้าง) */
        <View style={styles.innerContainerMobile}>
          <View style={styles.topRowMobile}>
            <Pressable onPress={() => router.push('/' as any)} style={styles.logoButton}>
              <ThemedText style={styles.logoIcon}>⌨️</ThemedText>
              <ThemedText type="smallBold" style={styles.logoTitle}>
                Extreme<ThemedText type="smallBold" style={{ color: '#6cc349' }}>Key</ThemedText>
              </ThemedText>
            </Pressable>
            {renderActionButtons()}
          </View>
          {renderSearchBar()}
        </View>
      ) : (
        /* โหมด Desktop/Tablet: จัดแถวเดียว (โลโก้ + ช่องค้นหาตรงกลาง + ปุ่มคำสั่งขวา) */
        <View style={styles.innerContainer}>
          <Pressable onPress={() => router.push('/' as any)} style={styles.logoButton}>
            <ThemedText style={styles.logoIcon}>⌨️</ThemedText>
            <ThemedText type="smallBold" style={styles.logoTitle}>
              Extreme<ThemedText type="smallBold" style={{ color: '#6cc349' }}>Key</ThemedText>
            </ThemedText>
          </Pressable>
          {renderSearchBar()}
          {renderActionButtons()}
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  headerWrapper: {
    width: '100%',
    borderBottomWidth: 2,
    borderBottomColor: '#3d3938',
    zIndex: 999,
  },
  // สไตล์สำหรับหน้าจอคอมฯ / แท็บเล็ต
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
  // สไตล์สำหรับหน้าจอมือถือ
  innerContainerMobile: {
    width: '100%',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: Spacing.two,
  },
  topRowMobile: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoIcon: {
    fontSize: 22,
  },
  logoTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  searchSection: {
    flex: 1,
    position: 'relative',
    zIndex: 1000,
    minWidth: 0,
  },
  searchSectionMobile: {
    width: '100%',
    flex: undefined,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3d3938',
    borderRadius: 0, // 0px voxel doctrine
    backgroundColor: '#262423',
    paddingHorizontal: Spacing.three,
    height: 40,
    gap: Spacing.two,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
    color: '#ede5e2',
    padding: 0,
    ...Platform.select({
      web: {
        outlineStyle: 'none' as any,
      },
    }),
  },
  actionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionIconButton: {
    width: 38,
    height: 38,
    borderRadius: 0, // 0px voxel doctrine
    borderWidth: 1,
    borderColor: '#3d3938',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#6cc349',
    borderRadius: 0, // 0px voxel doctrine
    minWidth: 17,
    height: 17,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  pressed: {
    opacity: 0.7,
  },
});
