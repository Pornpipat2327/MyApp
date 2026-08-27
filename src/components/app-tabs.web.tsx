import React, { useEffect, useState } from 'react';
import { usePathname } from 'expo-router';
import {
  TabList,
  TabListProps,
  Tabs,
  TabSlot,
  TabTrigger,
  TabTriggerSlotProps,
} from 'expo-router/ui';
import { SymbolView } from 'expo-symbols';
import { Platform, Pressable, StyleSheet, useColorScheme, View } from 'react-native';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { Colors, Spacing } from '@/constants/theme';

export default function AppTabs() {
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkRole = () => {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const userObj = JSON.parse(userStr);
            const role = (userObj?.role ?? '').toLowerCase();
            setIsAdmin(role === 'admin');
            return;
          } catch (e) {
            // ignore parse error
          }
        }
        setIsAdmin(false);
      }
    };

    checkRole();

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.addEventListener('storage', checkRole);
      window.addEventListener('auth-change', checkRole);
      return () => {
        window.removeEventListener('storage', checkRole);
        window.removeEventListener('auth-change', checkRole);
      };
    }
  }, [pathname]);

  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="home" href="/" asChild>
            <TabButton iconName="home">Home</TabButton>
          </TabTrigger>
          <TabTrigger name="product" href="/product" asChild>
            <TabButton iconName="shopping_bag">Product</TabButton>
          </TabTrigger>
          {isAdmin ? (
            <TabTrigger name="add" href="/add" asChild>
              <TabButton iconName="edit_note">Add</TabButton>
            </TabTrigger>
          ) : (
            <TabTrigger name="add" href="/add" style={{ display: 'none' }} />
          )}
          <TabTrigger name="categories" href="/categories" asChild>
            <TabButton iconName="category">Categories</TabButton>
          </TabTrigger>
          {/* Hidden screens — registered for navigation but not shown in tab bar */}
          <TabTrigger name="cart" href="/cart" style={{ display: 'none' }} />
          <TabTrigger name="checkout" href="/checkout" style={{ display: 'none' }} />
          <TabTrigger name="orders" href="/orders" style={{ display: 'none' }} />
          <TabTrigger name="login" href="/login" style={{ display: 'none' }} />
          <TabTrigger name="edit" href="/edit" style={{ display: 'none' }} />
          <TabTrigger name="detail" href="/detail" style={{ display: 'none' }} />
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

interface CustomTabButtonProps extends TabTriggerSlotProps {
  iconName: string;
}

const ICON_MAP: Record<string, { ios: string; web: string }> = {
  home: { ios: 'house.fill', web: 'home' },
  shopping_bag: { ios: 'bag.fill', web: 'shopping_bag' },
  edit_note: { ios: 'square.and.pencil', web: 'edit_note' },
  category: { ios: 'square.grid.2x2.fill', web: 'category' },
};

export function TabButton({ children, isFocused, iconName, ...props }: CustomTabButtonProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const icon = ICON_MAP[iconName] ?? { ios: iconName, web: iconName };

  return (
    <Pressable {...props} style={({ pressed }) => pressed && styles.pressed}>
      <ThemedView
        type={isFocused ? 'backgroundSelected' : 'backgroundElement'}
        style={styles.tabButtonView}>
        <SymbolView
          tintColor={isFocused ? colors.text : colors.textSecondary}
          name={{ ios: icon.ios, web: icon.web } as any}
          size={16}
        />
        <ThemedText type="small" themeColor={isFocused ? 'text' : 'textSecondary'}>
          {children}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  return (
    <View {...props} style={styles.tabListContainer}>
      <ThemedView type="backgroundElement" style={styles.innerContainer}>
        {props.children}
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    zIndex: 100,
  } as any,
  innerContainer: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.five,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.four,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  pressed: {
    opacity: 0.7,
  },
  tabButtonView: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.three,
  },
});
