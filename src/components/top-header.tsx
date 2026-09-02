import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCart } from '@/hooks/use-cart';
import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';
import {
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  Image,
  ScrollView,
} from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { useSearchHistory } from '@/hooks/use-search-history';
import { getProductsApiUrl, getBaseUrl } from '@/constants/api';

interface TopHeaderProps {
  searchQuery?: string;
  onSearchChange?: (text: string) => void;
}

interface QuickProduct {
  id: string | number;
  name: string;
  category?: string;
  price: string | number;
  image?: string;
}

export function TopHeader({ searchQuery, onSearchChange }: TopHeaderProps) {
  const theme = useTheme();
  const router = useRouter();
  const { totalItems } = useCart();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Search state
  const isControlled = onSearchChange !== undefined;
  const [internalQuery, setInternalQuery] = useState(searchQuery || '');
  const [isFocused, setIsFocused] = useState(false);
  const [allProducts, setAllProducts] = useState<QuickProduct[]>([]);
  const [hasFetchedProducts, setHasFetchedProducts] = useState(false);

  const { recentSearches, popularTags, addSearch, removeSearch, clearSearches } = useSearchHistory();
  const blurTimeoutRef = useRef<any>(null);

  const activeQuery = isControlled ? (searchQuery ?? '') : internalQuery;

  // Sync internal query when controlled prop changes
  useEffect(() => {
    if (searchQuery !== undefined) {
      setInternalQuery(searchQuery);
    }
  }, [searchQuery]);

  // Auth check
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

  // Lazy fetch products for auto-complete when search is focused
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
    // Slight delay so clicks inside dropdown can register
    blurTimeoutRef.current = setTimeout(() => {
      setIsFocused(false);
    }, 220);
  };

  const handleTextChange = (text: string) => {
    setInternalQuery(text);
    if (onSearchChange) {
      onSearchChange(text);
    }
  };

  const handleClear = () => {
    setInternalQuery('');
    if (onSearchChange) {
      onSearchChange('');
    }
  };

  const executeSearch = (queryToSearch: string) => {
    const trimmed = queryToSearch.trim();
    if (trimmed) {
      addSearch(trimmed);
    }
    setIsFocused(false);

    if (onSearchChange) {
      onSearchChange(trimmed);
    } else {
      router.push({
        pathname: '/product' as any,
        params: { search: trimmed },
      });
    }
  };

  const handleSelectProduct = (product: QuickProduct) => {
    addSearch(product.name);
    setIsFocused(false);
    router.push({
      pathname: '/detail' as any,
      params: { id: String(product.id) },
    });
  };

  const handleSelectTag = (tag: string) => {
    handleTextChange(tag);
    executeSearch(tag);
  };

  // Instant Suggestions (filtered top 4)
  const suggestions = useMemo(() => {
    if (!activeQuery.trim()) return [];
    const qTokens = activeQuery.toLowerCase().trim().split(/\s+/);
    return allProducts
      .filter((p) => {
        const text = `${p.name} ${p.category || ''}`.toLowerCase();
        return qTokens.every((token) => text.includes(token));
      })
      .slice(0, 4);
  }, [allProducts, activeQuery]);

  const getImageSource = (imagePath?: string) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
      return { uri: imagePath };
    }
    if (imagePath.startsWith('/uploads/') || imagePath.startsWith('/')) {
      return { uri: `${getBaseUrl()}${imagePath}` };
    }
    return null;
  };

  const showDropdown = isFocused;

  return (
    <ThemedView type="background" style={styles.headerContainer}>
      <View style={styles.innerContainer}>
        {/* Brand Logo */}
        <Pressable onPress={() => router.push('/')} style={({ pressed }) => pressed && styles.pressed}>
          <ThemedText type="smallBold" style={styles.logoText}>
            ExtremeKeys
          </ThemedText>
        </Pressable>

        {/* Search Bar Container */}
        <View style={styles.searchWrapper}>
          <View style={[styles.searchBar, isFocused && styles.searchBarActive]}>
            <Pressable onPress={() => executeSearch(activeQuery)}>
              <SymbolView
                tintColor={isFocused ? '#6cc349' : theme.textSecondary}
                name={{ ios: 'magnifyingglass', android: 'search', web: 'search' } as any}
                size={16}
              />
            </Pressable>
            <TextInput
              placeholder="Search keyboards, switches..."
              placeholderTextColor={theme.textSecondary}
              value={activeQuery}
              onChangeText={handleTextChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onSubmitEditing={() => executeSearch(activeQuery)}
              returnKeyType="search"
              style={[styles.searchInput, { color: theme.text }]}
            />
            {activeQuery.length > 0 && (
              <Pressable onPress={handleClear} style={styles.clearButton} hitSlop={6}>
                <ThemedText style={styles.clearButtonText}>✕</ThemedText>
              </Pressable>
            )}
          </View>

          {/* Level 2: Live Dropdown / Suggestions */}
          {showDropdown && (
            <ThemedView type="backgroundElement" style={styles.dropdown}>
              {activeQuery.trim().length > 0 ? (
                /* Auto-complete Product Matches */
                <View>
                  <View style={styles.dropdownHeader}>
                    <ThemedText type="smallBold" style={styles.dropdownSectionTitle}>
                      Products Matching "{activeQuery}"
                    </ThemedText>
                  </View>

                  {suggestions.length > 0 ? (
                    <View>
                      {suggestions.map((item) => (
                        <Pressable
                          key={item.id}
                          onPress={() => handleSelectProduct(item)}
                          style={({ pressed }) => [styles.suggestionRow, pressed && styles.suggestionRowPressed]}
                        >
                          <View style={styles.thumbWrapper}>
                            {getImageSource(item.image) ? (
                              <Image source={getImageSource(item.image)!} style={styles.thumbImage} resizeMode="cover" />
                            ) : (
                              <View style={styles.thumbPlaceholder}>
                                <SymbolView tintColor={theme.textSecondary} name={{ ios: 'keyboard', android: 'keyboard', web: 'keyboard' } as any} size={14} />
                              </View>
                            )}
                          </View>

                          <View style={styles.suggestionInfo}>
                            <ThemedText type="smallBold" numberOfLines={1} style={styles.suggestionTitle}>
                              {item.name}
                            </ThemedText>
                            <ThemedText type="small" style={styles.suggestionCategory}>
                              {item.category || 'General'}
                            </ThemedText>
                          </View>

                          <ThemedText type="smallBold" style={styles.suggestionPrice}>
                            ${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
                          </ThemedText>
                        </Pressable>
                      ))}

                      {/* View full results CTA */}
                      <Pressable
                        onPress={() => executeSearch(activeQuery)}
                        style={({ pressed }) => [styles.viewAllResultsBtn, pressed && styles.pressed]}
                      >
                        <ThemedText type="smallBold" style={styles.viewAllText}>
                          View all results for "{activeQuery}" →
                        </ThemedText>
                      </Pressable>
                    </View>
                  ) : (
                    <View style={styles.noSuggestionBox}>
                      <ThemedText type="small" themeColor="textSecondary">
                        No instant match. Press Enter to view full catalog.
                      </ThemedText>
                    </View>
                  )}
                </View>
              ) : (
                /* Empty Input: Show Recent Searches & Trending Tags */
                <ScrollView keyboardShouldPersistTaps="handled">
                  {recentSearches.length > 0 && (
                    <View style={styles.recentSection}>
                      <View style={styles.dropdownHeader}>
                        <ThemedText type="smallBold" style={styles.dropdownSectionTitle}>
                          Recent Searches
                        </ThemedText>
                        <Pressable onPress={clearSearches} hitSlop={4}>
                          <ThemedText type="small" style={styles.clearHistoryText}>
                            Clear
                          </ThemedText>
                        </Pressable>
                      </View>

                      <View style={styles.recentChipsRow}>
                        {recentSearches.map((item, idx) => (
                          <View key={idx} style={styles.recentChip}>
                            <Pressable onPress={() => handleSelectTag(item)} style={{ flex: 1 }}>
                              <ThemedText type="small" numberOfLines={1} style={styles.recentChipText}>
                                ⏱ {item}
                              </ThemedText>
                            </Pressable>
                            <Pressable onPress={() => removeSearch(item)} hitSlop={4}>
                              <ThemedText style={styles.removeChipText}>✕</ThemedText>
                            </Pressable>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Trending Categories / Tags */}
                  <View style={styles.popularSection}>
                    <View style={styles.dropdownHeader}>
                      <ThemedText type="smallBold" style={styles.dropdownSectionTitle}>
                        Popular Categories
                      </ThemedText>
                    </View>
                    <View style={styles.tagsRow}>
                      {popularTags.map((tag) => (
                        <Pressable
                          key={tag}
                          onPress={() => handleSelectTag(tag)}
                          style={({ pressed }) => [styles.tagChip, pressed && styles.pressed]}
                        >
                          <ThemedText type="smallBold" style={styles.tagChipText}>
                            #{tag}
                          </ThemedText>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                </ScrollView>
              )}
            </ThemedView>
          )}
        </View>

        {/* Icons Area */}
        <View style={styles.iconsContainer}>
          {/* Cart Icon */}
          <Pressable
            onPress={() => router.push('/cart' as any)}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          >
            <SymbolView
              tintColor={theme.text}
              name={{ ios: 'cart', android: 'shopping_cart', web: 'shopping_cart' } as any}
              size={20}
            />
            {totalItems > 0 && (
              <View style={styles.badge}>
                <ThemedText style={styles.badgeText}>
                  {totalItems > 99 ? '99+' : totalItems}
                </ThemedText>
              </View>
            )}
          </Pressable>

          {/* Orders Icon */}
          <Pressable
            onPress={() => router.push('/orders' as any)}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          >
            <SymbolView
              tintColor={theme.text}
              name={{ ios: 'doc.plaintext', android: 'receipt_long', web: 'receipt_long' } as any}
              size={20}
            />
          </Pressable>

          {/* Profile / Account Icon */}
          <Pressable
            onPress={() => router.push('/login' as any)}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          >
            <SymbolView
              tintColor={isLoggedIn ? '#6cc349' : theme.text}
              name={{ ios: 'person.crop.circle', android: 'person', web: 'person' } as any}
              size={20}
            />
            {isLoggedIn && <View style={styles.onlineDot} />}
          </Pressable>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    backgroundColor: '#313131',          // canvas-dark
    borderBottomWidth: 2,
    borderBottomColor: '#3d3938',         // surface-dark-soft divider
    zIndex: 100,
    ...Platform.select({
      web: {
        position: 'sticky',
        top: 0,
      },
    }),
  },
  innerContainer: {
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: 10,
    gap: Spacing.three,
  },
  logoText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    color: '#6cc349',                     // vanilla-green-3 brand voltage
    ...Platform.select({
      web: { fontFamily: 'var(--font-display)' },
    }),
  },
  searchWrapper: {
    flex: 1,
    maxWidth: 340,
    position: 'relative',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: 0,                      // 0px — voxel doctrine
    borderWidth: 1,
    borderColor: '#898481',               // grey-soft border
    backgroundColor: '#262423',           // surface-mid input bg
    gap: Spacing.two,
  },
  searchBarActive: {
    borderColor: '#6cc349',               // vanilla-green-3 focus border
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#ede5e2',                     // grey-warm-1 input text
    padding: 0,
    ...Platform.select({
      web: {
        outlineStyle: 'none' as any,
        fontFamily: 'var(--font-sans)',
      },
    }),
  },
  clearButton: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    color: '#898481',
    fontSize: 12,
    fontWeight: '700',
  },
  dropdown: {
    position: 'absolute',
    top: 42,
    left: 0,
    right: 0,
    backgroundColor: '#262423',           // surface-mid
    borderWidth: 2,
    borderColor: '#3d3938',               // surface-dark-soft
    borderRadius: 0,                      // 0px — voxel doctrine
    maxHeight: 380,
    zIndex: 999,
    ...Platform.select({
      web: {
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
      } as any,
    }),
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.one,
    borderBottomWidth: 1,
    borderBottomColor: '#3d3938',
  },
  dropdownSectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#d0c5c0',
  },
  clearHistoryText: {
    fontSize: 11,
    color: '#ff605e',                     // warning-red
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: '#313131',
    gap: Spacing.two,
  },
  suggestionRowPressed: {
    backgroundColor: '#313131',
  },
  thumbWrapper: {
    width: 32,
    height: 32,
    borderRadius: 0,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#3d3938',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1d1e1e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionInfo: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 13,
    color: '#ede5e2',
  },
  suggestionCategory: {
    fontSize: 11,
    color: '#898481',
    textTransform: 'uppercase',
  },
  suggestionPrice: {
    fontSize: 13,
    color: '#6cc349',                     // vanilla-green-3
    fontWeight: '800',
  },
  viewAllResultsBtn: {
    paddingVertical: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#313131',
    borderTopWidth: 1,
    borderTopColor: '#3d3938',
  },
  viewAllText: {
    fontSize: 12,
    color: '#6cc349',
    letterSpacing: 0.5,
  },
  noSuggestionBox: {
    padding: Spacing.three,
    alignItems: 'center',
  },
  recentSection: {
    paddingBottom: Spacing.two,
  },
  recentChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: Spacing.two,
    gap: Spacing.one,
  },
  recentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#313131',
    borderWidth: 1,
    borderColor: '#3d3938',
    borderRadius: 0,
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    gap: 6,
    maxWidth: '48%',
  },
  recentChipText: {
    fontSize: 12,
    color: '#d0c5c0',
  },
  removeChipText: {
    fontSize: 11,
    color: '#898481',
  },
  popularSection: {
    paddingBottom: Spacing.two,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: Spacing.two,
    gap: Spacing.one,
  },
  tagChip: {
    backgroundColor: 'rgba(108,195,73,0.1)',
    borderWidth: 1,
    borderColor: '#6cc349',
    borderRadius: 0,
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
  },
  tagChipText: {
    fontSize: 11,
    color: '#6cc349',
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  iconButton: {
    padding: Spacing.one,
    position: 'relative',
  },
  pressed: {
    opacity: 0.7,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ff605e',           // warning-red
    borderRadius: 0,                      // 0px — voxel doctrine
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '700',
  },
  onlineDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 0,                      // 0px — voxel doctrine
    backgroundColor: '#6cc349',           // vanilla-green-3
  },
});
