/**
 * @file app-tabs.tsx
 * @description เมนูแท็บนำทางหลัก (Native Tabs Navigator) สำหรับแพลตฟอร์ม iOS และ Android
 *
 * แสดงเฉพาะ 4 แท็บหลักในแถบนำทาง:
 * - Home, Product, Add (Admin เท่านั้น), Categories
 * หน้าย่อย (Detail, Cart, Checkout, Login, Orders, Edit) ใช้ Navigation ปกติ
 * และจะซ่อนแถบแท็บล่างอัตโนมัติเพื่อใช้พื้นที่หน้าจอเต็มรูปแบบ
 */

import React, { useEffect, useState } from 'react';
import { usePathname } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';
import { getStorageItem, subscribeStorageChange } from '@/utils/storage';

/** หน้าย่อยที่ไม่แสดงแถบแท็บ (full-screen pages) */
const HIDDEN_TAB_PAGES = ['/detail', '/cart', '/checkout', '/orders', '/login', '/edit', '/explore'];

function isHiddenPage(pathname: string): boolean {
  return HIDDEN_TAB_PAGES.some((p) => pathname.startsWith(p));
}

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  // ─── ตรวจสอบสิทธิ์ Admin ─────────────────────────────────────────────────
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

    // ดักฟัง auth-change ผ่าน Universal Event Emitter (ทำงานทั้ง Mobile และ Web)
    return subscribeStorageChange('auth-change', checkRole);
  }, []);

  const hideTabBar = isHiddenPage(pathname);

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}
      hidden={hideTabBar}
    >
      {/* ─── 4 Main Tabs ─── */}
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'house', selected: 'house.fill' }}
          md="home"
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="product">
        <NativeTabs.Trigger.Label>Products</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'keyboard', selected: 'keyboard.fill' }}
          md="keyboard"
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      {isAdmin ? (
        <NativeTabs.Trigger name="add">
          <NativeTabs.Trigger.Label>Add</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: 'plus.circle', selected: 'plus.circle.fill' }}
            md="add_circle"
            renderingMode="template"
          />
        </NativeTabs.Trigger>
      ) : (
        <NativeTabs.Trigger name="add" hidden />
      )}

      <NativeTabs.Trigger name="categories">
        <NativeTabs.Trigger.Label>Categories</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'square.grid.2x2', selected: 'square.grid.2x2.fill' }}
          md="grid_view"
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      {/* ─── Hidden Pages (ลงทะเบียนเพื่อ Navigation แต่ไม่แสดงในแถบ) ─── */}
      <NativeTabs.Trigger name="cart" hidden />
      <NativeTabs.Trigger name="checkout" hidden />
      <NativeTabs.Trigger name="orders" hidden />
      <NativeTabs.Trigger name="login" hidden />
      <NativeTabs.Trigger name="edit" hidden />
      <NativeTabs.Trigger name="detail" hidden />
      <NativeTabs.Trigger name="explore" hidden />
    </NativeTabs>
  );
}
