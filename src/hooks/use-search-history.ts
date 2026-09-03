/**
 * @file use-search-history.ts
 * @description Hook จัดการประวัติการค้นหาล่าสุด (Search History) — Cross-platform
 */

import { useState, useEffect, useCallback } from 'react';
import { getStorageItem, setStorageItem, removeStorageItem, subscribeStorageChange } from '@/utils/storage';

const RECENT_SEARCHES_KEY = 'extreme_keys_recent_searches';
const MAX_RECENT_SEARCHES = 6;

/** รายการแท็กหมวดหมู่ยอดนิยมสำหรับแนะนำการค้นหา */
export const POPULAR_TAGS = ['Wireless', 'Gaming', 'Mechanical', 'Compact', 'Vintage', 'Ergonomic'];

function loadSearches(): string[] {
  try {
    const raw = getStorageItem(RECENT_SEARCHES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.slice(0, MAX_RECENT_SEARCHES);
  } catch {}
  return [];
}

export function useSearchHistory() {
  const [recentSearches, setRecentSearches] = useState<string[]>(() => loadSearches());

  // ซิงค์เมื่อ storage เปลี่ยนแปลงจากแหล่งอื่น (บน Web: ซิงค์จากแท็บอื่น)
  useEffect(() => {
    const syncSearches = () => {
      setRecentSearches(loadSearches());
    };
    return subscribeStorageChange('search-history-change', syncSearches);
  }, []);

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

      try {
        setStorageItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch {}

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

      try {
        setStorageItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch {}

      return updated;
    });
  }, []);

  /**
   * ล้างประวัติการค้นหาทั้งหมด
   */
  const clearSearches = useCallback(() => {
    setRecentSearches([]);
    try {
      removeStorageItem(RECENT_SEARCHES_KEY);
    } catch {}
  }, []);

  return {
    recentSearches,
    popularTags: POPULAR_TAGS,
    addSearch,
    removeSearch,
    clearSearches,
  };
}
