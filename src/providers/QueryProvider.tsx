'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 2 * 60 * 1000, // 2 minutos - datos cacheados se muestran instant
            gcTime: 5 * 60 * 1000, // 5 minutos en memoria
            // No reintentar errores de autenticacion
            retry: (failureCount, error) => {
              const msg = error instanceof Error ? error.message : '';
              if (msg.includes('not authenticated') || msg.includes('JWT')) return false;
              return failureCount < 1;
            },
            // Desactivado: los hooks de visibilitychange ya manejan refetch al volver
            // Tenerlo activo causa avalancha de requests simultaneos al volver de idle
            refetchOnWindowFocus: false,
            // Refrescar automático en reconexión
            refetchOnReconnect: true,
            // Siempre refrescar al montar para datos actualizados
            refetchOnMount: true,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

