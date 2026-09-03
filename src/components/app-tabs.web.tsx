/**
 * @file app-tabs.web.tsx
 * @description เมนูแท็บนำทางหลัก (Web Bottom Navigation Bar) สไตล์ Voxel/Minecraft สำหรับหน้าจอ Web
 * รองรับทั้งโหมด Mobile (ความกว้างกระจาย 25% เท่ากันทั้ง 4 แท็บ ไม่มีข้อความหลุดขอบ) และ Desktop
 */

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
import { Pressable, StyleSheet, View, useWindowDimensions, Platform } from 'react-native';
import { getStorageItem, subscribeStorageChange } from '@/utils/storage';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { Spacing } from '@/constants/theme';

export default function AppTabs() {
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const isMobile = width < 640;

  useEffect(() => {
    const checkRole = () => {
      const userStr = getStorageItem('user');
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr);
          const role = (userObj?.role ?? '').toLowerCase();
          setIsAdmin(role === 'admin');
          return;
        } catch {
          // ไม่สามารถแปลง JSON ได้
        }
      }
      setIsAdmin(false);
    };

    checkRole();
    return subscribeStorageChange('auth-change', checkRole);
  }, [pathname]);

  // ซ่อนแท็บบาร์เมื่ออยู่ในหน้า Login
  const hideTabBar = pathname === '/login';

  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList isMobile={isMobile} hideTabBar={hideTabBar}>
          <TabTrigger name="home" href="/" asChild>
            <TabButton iconName="home" isMobile={isMobile}>Home</TabButton>
          </TabTrigger>
          <TabTrigger name="product" href="/product" asChild>
            <TabButton iconName="shopping_bag" isMobile={isMobile}>Product</TabButton>
          </TabTrigger>
          {isAdmin ? (
            <TabTrigger name="add" href="/add" asChild>
              <TabButton iconName="edit_note" isMobile={isMobile}>Add</TabButton>
            </TabTrigger>
          ) : (
            <TabTrigger name="add" href="/add" style={{ display: 'none' }} />
          )}
          <TabTrigger name="categories" href="/categories" asChild>
            <TabButton iconName="category" isMobile={isMobile}>Categories</TabButton>
          </TabTrigger>

          {/* หน้าที่ซ่อนจากแท็บบาร์ แต่ลงทะเบียนไว้เพื่อการนำทาง */}
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
  isMobile?: boolean;
}

const ICON_MAP: Record<string, { ios: string; web: string }> = {
  home: { ios: 'house.fill', web: 'home' },
  shopping_bag: { ios: 'bag.fill', web: 'shopping_bag' },
  edit_note: { ios: 'square.and.pencil', web: 'edit_note' },
  category: { ios: 'square.grid.2x2.fill', web: 'category' },
};

export function TabButton({ children, isFocused, iconName, isMobile, ...props }: CustomTabButtonProps) {
  const icon = ICON_MAP[iconName] ?? { ios: iconName, web: iconName };

  const activeTint = '#6cc349'; // Vanilla green
  const inactiveTint = '#898481'; // Grey soft

  if (isMobile) {
    return (
      <Pressable
        {...props}
        style={({ pressed }) => [
          styles.tabPressableMobile,
          pressed && styles.pressed,
        ]}
      >
        <View
          style={[
            styles.tabButtonViewMobile,
            isFocused && styles.tabButtonViewMobileActive,
          ]}
        >
          <SymbolView
            tintColor={isFocused ? activeTint : inactiveTint}
            name={{ ios: icon.ios, web: icon.web } as any}
            size={18}
          />
          <ThemedText
            type="small"
            style={[
              styles.tabLabelMobile,
              { color: isFocused ? activeTint : inactiveTint },
            ]}
            numberOfLines={1}
          >
            {children}
          </ThemedText>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      {...props}
      style={({ pressed }) => [
        styles.tabPressableDesktop,
        pressed && styles.pressed,
      ]}
    >
      <ThemedView
        type={isFocused ? 'backgroundSelected' : 'backgroundElement'}
        style={styles.tabButtonView}
      >
        <SymbolView
          tintColor={isFocused ? activeTint : inactiveTint}
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

interface CustomTabListExtraProps extends TabListProps {
  isMobile?: boolean;
  hideTabBar?: boolean;
}

export function CustomTabList({ isMobile, hideTabBar, ...props }: CustomTabListExtraProps) {
  return (
    <View
      {...props}
      style={[
        styles.tabListContainer,
        hideTabBar && { display: 'none' },
      ]}
    >
      <ThemedView
        type="backgroundElement"
        style={isMobile ? styles.innerContainerMobile : styles.innerContainer}
      >
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
    padding: 0,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    zIndex: 100,
    borderTopWidth: 2,
    borderTopColor: '#3d3938',
    backgroundColor: '#1d1e1e',
  } as any,

  // สไตล์สำหรับ Desktop
  innerContainer: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.four,
    width: '100%',
    maxWidth: 800,
  },
  tabPressableDesktop: {
    borderRadius: 0,
    ...Platform.select({
      web: {
        outlineStyle: 'none' as any,
      },
    }),
  },
  tabButtonView: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: 0,
  },

  // สไตล์สำหรับ Mobile (แบ่งพื้นที่ 25% เท่ากันต่อแท็บ ไอคอนบน ตัวหนังสือล่าง)
  innerContainerMobile: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 4,
    paddingHorizontal: 0,
    gap: 0,
    backgroundColor: '#1d1e1e',
  },
  tabPressableMobile: {
    flex: 1,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 0,
    ...Platform.select({
      web: {
        outlineStyle: 'none' as any,
        WebkitTapHighlightColor: 'transparent' as any,
      },
    }),
  },
  tabButtonViewMobile: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    width: '100%',
    paddingVertical: 4,
    paddingHorizontal: 2,
    borderRadius: 0,
  },
  tabButtonViewMobileActive: {
    backgroundColor: 'rgba(108, 195, 73, 0.08)',
    borderTopWidth: 2,
    borderTopColor: '#6cc349',
  },
  tabLabelMobile: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },

  pressed: {
    opacity: 0.7,
  },
});
