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
            // Reintentar 1 vez en caso de error
            retry: 1,
            // Refrescar cuando la ventana recupera el foco (datos frescos)
            refetchOnWindowFocus: true,
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

