import React, { useEffect, useState } from 'react';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCart } from '@/hooks/use-cart';
import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface TopHeaderProps {
  searchQuery?: string;
  onSearchChange?: (text: string) => void;
}

export function TopHeader({ searchQuery = '', onSearchChange }: TopHeaderProps) {
  const theme = useTheme();
  const router = useRouter();
  const { totalItems } = useCart();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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

  return (
    <ThemedView type="background" style={styles.headerContainer}>
      <View style={styles.innerContainer}>
        {/* Brand Logo */}
        <Pressable onPress={() => router.push('/')} style={({ pressed }) => pressed && styles.pressed}>
          <ThemedText type="smallBold" style={styles.logoText}>
            ExtremeKeys
          </ThemedText>
        </Pressable>

        {/* Search Bar */}
        <View style={[styles.searchBar, { backgroundColor: theme.backgroundElement }]}>
          <SymbolView
            tintColor={theme.textSecondary}
            name={{ ios: 'magnifyingglass', android: 'search', web: 'search' } as any}
            size={16}
          />
          <TextInput
            placeholder="Search products..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={onSearchChange}
            style={[styles.searchInput, { color: theme.text }]}
          />
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
            {/* Dynamic Cart Item Count Badge */}
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
              tintColor={isLoggedIn ? '#34C759' : theme.text}
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,128,128,0.15)',
    zIndex: 10,
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
    paddingVertical: Spacing.three,
    gap: Spacing.three,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.three,
    maxWidth: 320,
    gap: Spacing.two,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
    ...Platform.select({
      web: {
        outlineStyle: 'none' as any,
      },
    }),
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
    backgroundColor: '#ff3b30',
    borderRadius: 8,
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
    borderRadius: 4,
    backgroundColor: '#34C759',
  },
});
