'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Siempre refrescar datos para dashboards y perfiles
            staleTime: 0, // Considerar datos como obsoletos inmediatamente
            // Mantener datos en memoria por tiempo mínimo
            gcTime: 1 * 60 * 1000, // 1 minuto
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

