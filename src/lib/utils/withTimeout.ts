/**
 * Helper centralizado para timeout y retry automático
 * Diseñado específicamente para Supabase Free Tier (cold starts, latencia variable)
 * 
 * Reglas OBLIGATORIAS:
 * - Timeout de 1000ms
 * - Retry automático una sola vez si hay timeout
 * - Si el segundo intento falla, manejar silenciosamente
 * - Nunca dejar la UI bloqueada
 */

/**
 * Wrapper con timeout y retry automático
 * 
 * @param fetcher - Función que retorna la promesa (para poder recrearla en el retry)
 * @param timeoutMs - Tiempo máximo en ms antes de considerar timeout (default: 1000ms)
 * @returns La promesa con timeout y retry automático
 */
export const withTimeout = async <T,>(
  fetcher: () => Promise<T>,
  timeoutMs: number = 1000
): Promise<T> => {
  try {
    // Primer intento
    return await Promise.race([
      fetcher(),
      new Promise<T>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), timeoutMs)
      )
    ]);
  } catch (error: any) {
    // Si es timeout, hacer retry automático una única vez
    if (error?.message === 'Timeout') {
      // Esperar un momento antes del retry
      await new Promise(resolve => setTimeout(resolve, 200));
      
      try {
        // Retry automático - recrear la promesa
        return await Promise.race([
          fetcher(),
          new Promise<T>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), timeoutMs)
          )
        ]);
      } catch (retryError) {
        // Si el segundo intento también falla, lanzar error para que se maneje arriba
        throw retryError;
      }
    }
    // Si no es timeout, lanzar el error original
    throw error;
  }
};

/**
 * Wrapper para Supabase queries que maneja correctamente los tipos
 */
export const withSupabaseTimeout = async <T,>(
  query: Promise<{ data: T | null; error: any }>,
  timeoutMs: number = 1000
): Promise<{ data: T | null; error: any }> => {
  try {
    return await withTimeout(() => query, timeoutMs);
  } catch {
    // Error silencioso, retornar estructura vacía
    return { data: null, error: null };
  }
};

/**
 * Wrapper para servicios que retornan { success, data, error }
 */
export const withServiceTimeout = async <T,>(
  serviceCall: () => Promise<{ success: boolean; data?: T; error?: string }>,
  timeoutMs: number = 1000
): Promise<{ success: boolean; data?: T; error?: string }> => {
  try {
    return await withTimeout(serviceCall, timeoutMs);
  } catch {
    // Error silencioso, retornar estructura de error
    return { success: false, error: undefined };
  }
};
