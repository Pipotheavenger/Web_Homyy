/**
 * Utilidades de caché local para mejorar rendimiento
 * Usa localStorage para persistir datos entre sesiones
 */

const CACHE_PREFIX = 'hommy_cache_';
const CACHE_VERSION = '1.0';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version: string;
}

/**
 * Obtener datos del caché local
 */
export function getCachedData<T>(key: string, ttl: number = 5 * 60 * 1000): T | null {
  try {
    const cached = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!cached) return null;

    const entry: CacheEntry<T> = JSON.parse(cached);
    
    // Verificar versión
    if (entry.version !== CACHE_VERSION) {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }

    // Verificar TTL
    if (Date.now() - entry.timestamp > ttl) {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }

    return entry.data;
  } catch (error) {
    console.warn('Error leyendo caché:', error);
    return null;
  }
}

/**
 * Guardar datos en caché local
 */
export function setCachedData<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      version: CACHE_VERSION,
    };
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(entry));
  } catch (error) {
    console.warn('Error guardando en caché:', error);
    // Si localStorage está lleno, limpiar cachés antiguos
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      clearOldCache();
    }
  }
}

/**
 * Limpiar cachés antiguos
 */
function clearOldCache(): void {
  try {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
    
    // Ordenar por timestamp y eliminar los más antiguos
    const entries = cacheKeys.map(key => {
      try {
        const entry = JSON.parse(localStorage.getItem(key) || '{}');
        return { key, timestamp: entry.timestamp || 0 };
      } catch {
        return { key, timestamp: 0 };
      }
    }).sort((a, b) => a.timestamp - b.timestamp);

    // Eliminar la mitad más antigua
    const toRemove = Math.floor(entries.length / 2);
    for (let i = 0; i < toRemove; i++) {
      localStorage.removeItem(entries[i].key);
    }
  } catch (error) {
    console.warn('Error limpiando caché:', error);
  }
}

/**
 * Limpiar un caché específico
 */
export function clearCachedData(key: string): void {
  try {
    localStorage.removeItem(`${CACHE_PREFIX}${key}`);
  } catch (error) {
    console.warn('Error limpiando caché:', error);
  }
}

/**
 * Limpiar todo el caché
 */
export function clearAllCache(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.filter(key => key.startsWith(CACHE_PREFIX)).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.warn('Error limpiando todo el caché:', error);
  }
}




