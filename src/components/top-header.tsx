import React from 'react';
import { View, StyleSheet, Pressable, Platform, TextInput } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export function TopHeader() {
  const theme = useTheme();

  return (
    <ThemedView type="background" style={styles.headerContainer}>
      <View style={styles.innerContainer}>
        {/* Brand Logo */}
        <ThemedText type="smallBold" style={styles.logoText}>
          KEYVAULT
        </ThemedText>

        {/* Search Bar */}
        <View style={[styles.searchBar, { backgroundColor: theme.backgroundElement }]}>
          <SymbolView
            tintColor={theme.textSecondary}
            name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
            size={16}
          />
          <TextInput
            placeholder="Search products..."
            placeholderTextColor={theme.textSecondary}
            style={[styles.searchInput, { color: theme.text }]}
          />
        </View>

        {/* Icons Area */}
        <View style={styles.iconsContainer}>
          <Pressable style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
            <SymbolView
              tintColor={theme.text}
              name={{ ios: 'bag', android: 'shopping-cart', web: 'shopping_cart' }}
              size={20}
            />
            {/* Cart Item Count Badge */}
            <View style={styles.badge}>
              <ThemedText style={styles.badgeText}>3</ThemedText>
            </View>
          </Pressable>

          <Pressable style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
            <SymbolView
              tintColor={theme.text}
              name={{ ios: 'person.crop.circle', android: 'person', web: 'person' }}
              size={20}
            />
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
        outlineStyle: 'none',
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
});
