/**
 * Utilidad para hacer fetch seguro con timeout y retry automático
 * Diseñado específicamente para Supabase Free Tier (cold starts, latencia variable)
 */

interface SafeFetchOptions {
  timeout?: number; // Tiempo máximo en ms antes de considerar timeout (default: 1000ms)
  maxRetries?: number; // Máximo de reintentos (default: 1)
  retryDelay?: number; // Delay entre reintentos en ms (default: 500ms)
  onRetry?: (attempt: number) => void; // Callback opcional para retry
}

/**
 * Wrapper para funciones async que añade timeout y retry automático
 * 
 * Si una función tarda más de timeout ms:
 * - Se cancela la petición original (si es posible)
 * - Se hace retry automático
 * - Si el retry también falla, se lanza el error
 * 
 * Esto previene cargas infinitas en Supabase Free Tier
 */
export async function safeFetch<T>(
  fetcher: () => Promise<T>,
  options: SafeFetchOptions = {}
): Promise<T> {
  const {
    timeout = 1000,
    maxRetries = 1,
    retryDelay = 500,
    onRetry,
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Crear promesa con timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Timeout después de ${timeout}ms`));
        }, timeout);
      });

      // Race entre la petición y el timeout
      const result = await Promise.race([
        fetcher(),
        timeoutPromise,
      ]);

      // Si llegamos aquí, la petición completó antes del timeout
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Error desconocido');

      // Si es el último intento, lanzar el error
      if (attempt >= maxRetries) {
        throw lastError;
      }

      // Si es timeout y hay retries disponibles, hacer retry
      if (lastError.message.includes('Timeout') && attempt < maxRetries) {
        if (onRetry) {
          onRetry(attempt + 1);
        }
        
        // Esperar antes del retry
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        continue;
      }

      // Si no es timeout, lanzar el error inmediatamente
      throw lastError;
    }
  }

  // Nunca debería llegar aquí, pero TypeScript lo requiere
  throw lastError || new Error('Error desconocido');
}

/**
 * Wrapper específico para Supabase que maneja cold starts
 */
export async function safeSupabaseFetch<T>(
  fetcher: () => Promise<T>,
  options: SafeFetchOptions = {}
): Promise<T> {
  // Para Supabase Free Tier, usar timeout más largo en el primer intento
  return safeFetch(fetcher, {
    timeout: 2000, // 2 segundos para cold starts
    maxRetries: 1,
    retryDelay: 1000, // 1 segundo entre retries
    ...options,
  });
}
