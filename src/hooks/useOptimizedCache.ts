import { useState, useEffect, useCallback, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface UseOptimizedCacheOptions<T> {
  key: string;
  fetcher: () => Promise<T>;
  ttl?: number; // Time to live in milliseconds
  staleTime?: number; // Time after which data is considered stale
  enabled?: boolean;
  onError?: (error: Error) => void;
}

export function useOptimizedCache<T>({
  key,
  fetcher,
  ttl = 5 * 60 * 1000, // 5 minutes default
  staleTime = 2 * 60 * 1000, // 2 minutes default
  enabled = true,
  onError
}: UseOptimizedCacheOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map());

  const getCachedData = useCallback(() => {
    const cached = cacheRef.current.get(key);
    if (!cached) return null;

    const now = Date.now();
    
    // Check if cache is expired
    if (now > cached.expiresAt) {
      cacheRef.current.delete(key);
      return null;
    }

    return cached.data;
  }, [key]);

  const setCachedData = useCallback((newData: T) => {
    const now = Date.now();
    cacheRef.current.set(key, {
      data: newData,
      timestamp: now,
      expiresAt: now + ttl
    });
  }, [key, ttl]);

  const fetchData = useCallback(async (force = false) => {
    if (!enabled) return;

    const cached = getCachedData();
    const now = Date.now();
    
    // Return cached data if it exists and is not stale, unless forced
    if (!force && cached) {
      const cacheEntry = cacheRef.current.get(key)!;
      if (now - cacheEntry.timestamp < staleTime) {
        setData(cached);
        setError(null);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      setData(result);
      setCachedData(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error);
      
      // Return stale data if available
      if (cached) {
        setData(cached);
      }
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, enabled, force, getCachedData, setCachedData, staleTime, onError]);

  const invalidate = useCallback(() => {
    cacheRef.current.delete(key);
    setData(null);
    setError(null);
  }, [key]);

  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    invalidate,
    refresh,
    isStale: data ? (Date.now() - (cacheRef.current.get(key)?.timestamp || 0)) > staleTime : false
  };
}

// Hook específico para datos que no cambian frecuentemente
export function useStaticData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: { enabled?: boolean; onError?: (error: Error) => void }
) {
  return useOptimizedCache({
    key,
    fetcher,
    ttl: 15 * 60 * 1000, // 15 minutes
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options
  });
}

// Hook para datos que cambian frecuentemente
export function useDynamicData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: { enabled?: boolean; onError?: (error: Error) => void }
) {
  return useOptimizedCache({
    key,
    fetcher,
    ttl: 2 * 60 * 1000, // 2 minutes
    staleTime: 30 * 1000, // 30 seconds
    ...options
  });
}
