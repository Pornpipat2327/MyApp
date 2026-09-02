import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';

const RECENT_SEARCHES_KEY = 'extreme_keys_recent_searches';
const MAX_RECENT_SEARCHES = 6;

export const POPULAR_TAGS = ['Wireless', 'Gaming', 'Mechanical', 'Compact', 'Vintage', 'Ergonomic'];

export function useSearchHistory() {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const loadSearches = useCallback(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setRecentSearches(parsed.slice(0, MAX_RECENT_SEARCHES));
          }
        }
      } catch (e) {
        console.error('Failed to load recent searches', e);
      }
    }
  }, []);

  useEffect(() => {
    loadSearches();
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.addEventListener('storage', loadSearches);
      return () => window.removeEventListener('storage', loadSearches);
    }
  }, [loadSearches]);

  const addSearch = useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        const current = localStorage.getItem(RECENT_SEARCHES_KEY);
        let list: string[] = current ? JSON.parse(current) : [];
        // Remove duplicate if exists, then prepend
        list = [trimmed, ...list.filter((item) => item.toLowerCase() !== trimmed.toLowerCase())].slice(0, MAX_RECENT_SEARCHES);
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(list));
        setRecentSearches(list);
      } catch (e) {
        console.error('Failed to save search history', e);
      }
    }
  }, []);

  const removeSearch = useCallback((queryToRemove: string) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        const current = localStorage.getItem(RECENT_SEARCHES_KEY);
        if (current) {
          const list: string[] = JSON.parse(current).filter(
            (item: string) => item.toLowerCase() !== queryToRemove.toLowerCase()
          );
          localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(list));
          setRecentSearches(list);
        }
      } catch (e) {
        console.error('Failed to remove search item', e);
      }
    }
  }, []);

  const clearSearches = useCallback(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        localStorage.removeItem(RECENT_SEARCHES_KEY);
        setRecentSearches([]);
      } catch (e) {
        console.error('Failed to clear search history', e);
      }
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
