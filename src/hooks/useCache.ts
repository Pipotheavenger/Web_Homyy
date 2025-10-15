import { useState, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

export const useCache = <T>(defaultTtl: number = 5 * 60 * 1000) => { // 5 minutes default
  const [cache, setCache] = useState<Map<string, CacheEntry<T>>>(new Map());
  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map());

  const get = (key: string): T | null => {
    const entry = cacheRef.current.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      cacheRef.current.delete(key);
      setCache(new Map(cacheRef.current));
      return null;
    }

    return entry.data;
  };

  const set = (key: string, data: T, ttl: number = defaultTtl): void => {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl
    };

    cacheRef.current.set(key, entry);
    setCache(new Map(cacheRef.current));
  };

  const invalidate = (key: string): void => {
    cacheRef.current.delete(key);
    setCache(new Map(cacheRef.current));
  };

  const clear = (): void => {
    cacheRef.current.clear();
    setCache(new Map());
  };

  return {
    get,
    set,
    invalidate,
    clear,
    has: (key: string) => cacheRef.current.has(key)
  };
};
