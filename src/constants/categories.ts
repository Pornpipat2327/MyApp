/**
 * @file categories.ts
 * @description รายการหมวดหมู่สินค้าเริ่มต้น (Default Categories) พร้อมไอคอนและโทนสี
 */

import { ProductCategory } from '@/types/product';

/**
 * รายการหมวดหมู่คีย์บอร์ดมาตรฐานของร้านค้า
 */
export const DEFAULT_CATEGORIES: ProductCategory[] = [
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

/** รายชื่อหมวดหมู่แบบ Array of strings สำหรับ Dropdown หรือ Tag */
export const CATEGORY_NAMES: string[] = [
  'Gaming',
  'Wireless',
  'Vintage',
  'Ergonomic',
  'Compact',
  'Mechanical',
];
