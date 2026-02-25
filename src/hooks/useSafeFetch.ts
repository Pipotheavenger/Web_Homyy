'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface UseSafeFetchOptions<T> {
  fetcher: () => Promise<T>;
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  timeout?: number; // Tiempo máximo en ms antes de retry (default: 1000ms)
  maxRetries?: number; // Máximo de reintentos (default: 1)
  retryDelay?: number; // Delay entre reintentos en ms (default: 500ms)
}

interface UseSafeFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para hacer fetch seguro con retry automático y timeout
 * 
 * Características:
 * - Retry automático si la petición tarda más de timeout ms
 * - Manejo silencioso de errores (no bloquea la UI)
 * - Evita loops infinitos
 * - Cleanup automático al desmontar
 */
export function useSafeFetch<T>({
  fetcher,
  enabled = true,
  onSuccess,
  onError,
  timeout = 1000,
  maxRetries = 1,
  retryDelay = 500,
}: UseSafeFetchOptions<T>): UseSafeFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const mountedRef = useRef(true);
  const retryCountRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const executeFetch = useCallback(async (isRetry: boolean = false): Promise<void> => {
    if (!mountedRef.current) return;

    // Si es un retry, resetear loading solo si no hay datos previos
    if (!isRetry || !data) {
      setLoading(true);
    }
    setError(null);

    let timeoutTriggered = false;
    const timeoutId = setTimeout(() => {
      if (mountedRef.current && retryCountRef.current < maxRetries) {
        timeoutTriggered = true;
        retryCountRef.current++;
        
        // Retry automático después de delay
        retryTimeoutRef.current = setTimeout(() => {
          if (mountedRef.current) {
            executeFetch(true).catch(() => {
              // Error silencioso en retry
            });
          }
        }, retryDelay);
      }
    }, timeout);

    timeoutRef.current = timeoutId;

    try {
      const result = await fetcher();
      
      // Limpiar timeout si la petición completó antes
      if (timeoutRef.current) {
        clearTimeout(timeoutId);
        timeoutRef.current = null;
      }

      if (!mountedRef.current) return;

      // Si el timeout ya se disparó, ignorar este resultado (ya hay un retry en curso)
      if (timeoutTriggered) {
        return;
      }

      // Resetear contador de retry en éxito
      retryCountRef.current = 0;
      
      setData(result);
      setLoading(false);
      setError(null);
      
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      // Limpiar timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutId);
        timeoutRef.current = null;
      }

      if (!mountedRef.current) return;

      // Si el timeout ya se disparó, no hacer nada (ya hay un retry en curso)
      if (timeoutTriggered) {
        return;
      }

      const error = err instanceof Error ? err : new Error('Error desconocido');
      
      // Si ya se hizo el máximo de retries, marcar como error final
      if (retryCountRef.current >= maxRetries) {
        setError(error);
        setLoading(false);
        if (onError) {
          onError(error);
        }
      } else {
        // Si aún hay retries disponibles, hacer retry automático
        retryCountRef.current++;
        retryTimeoutRef.current = setTimeout(() => {
          if (mountedRef.current) {
            executeFetch(true).catch(() => {
              // Error silencioso en retry
            });
          }
        }, retryDelay);
      }
    }
  }, [fetcher, timeout, maxRetries, retryDelay, onSuccess, onError, data]);

  const refetch = useCallback(async () => {
    retryCountRef.current = 0;
    await executeFetch(false);
  }, [executeFetch]);

  useEffect(() => {
    mountedRef.current = true;
    
    if (enabled) {
      executeFetch(false).catch(() => {
        // Error silencioso
      });
    }

    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [enabled, executeFetch]);

  return { data, loading, error, refetch };
}
