/**
 * @file use-search-history.ts
 * @description Hook จัดการประวัติการค้นหาล่าสุด (Search History) และแท็กคำค้นหายอดนิยม
 */

import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';

const RECENT_SEARCHES_KEY = 'extreme_keys_recent_searches';
const MAX_RECENT_SEARCHES = 6;

/** รายการแท็กหมวดหมู่ยอดนิยมสำหรับแนะนำการค้นหา */
export const POPULAR_TAGS = ['Wireless', 'Gaming', 'Mechanical', 'Compact', 'Vintage', 'Ergonomic'];

export function useSearchHistory() {
  // โหลดข้อมูลประวัติเริ่มต้นจาก LocalStorage แบบ Lazy Initializer
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            return parsed.slice(0, MAX_RECENT_SEARCHES);
          }
        }
      } catch (e) {
        console.error('Failed to parse recent searches', e);
      }
    }
    return [];
  });

  const syncSearches = useCallback(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setRecentSearches(parsed.slice(0, MAX_RECENT_SEARCHES));
          }
        }
      } catch {}
    }
  }, []);

  // ดักจับการเปลี่ยนแปลงจากแท็บอื่นๆ
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.addEventListener('storage', syncSearches);
      return () => window.removeEventListener('storage', syncSearches);
    }
  }, [syncSearches]);

  /**
   * เพิ่มประวัติคำค้นหาใหม่
   */
  const addSearch = useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setRecentSearches((prev) => {
      const updated = [
        trimmed,
        ...prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase()),
      ].slice(0, MAX_RECENT_SEARCHES);

      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        try {
          localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
        } catch {}
      }

      return updated;
    });
  }, []);

  /**
   * ลบรายการค้นหารายตัว
   */
  const removeSearch = useCallback((queryToRemove: string) => {
    setRecentSearches((prev) => {
      const updated = prev.filter(
        (item) => item.toLowerCase() !== queryToRemove.toLowerCase()
      );

      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        try {
          localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
        } catch {}
      }

      return updated;
    });
  }, []);

  /**
   * ล้างประวัติการค้นหาทั้งหมด
   */
  const clearSearches = useCallback(() => {
    setRecentSearches([]);
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        localStorage.removeItem(RECENT_SEARCHES_KEY);
      } catch {}
    }
  }, []);

  return {
    recentSearches,
    popularTags: POPULAR_TAGS,
    addSearch,
    removeSearch,
    clearSearches,
  };
}
