'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Cache más agresivo para mejor rendimiento
            staleTime: 2 * 60 * 1000, // 2 minutos
            // Mantener datos en caché por 10 minutos
            gcTime: 10 * 60 * 1000,
            // Reintentar 1 vez en caso de error
            retry: 1,
            // NO refetch en background cuando la ventana recupera el foco (más rápido)
            refetchOnWindowFocus: false,
            // NO refetch automático en reconexión (más rápido)
            refetchOnReconnect: false,
            // NO refetch automático al montar si los datos están frescos
            refetchOnMount: false,
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

