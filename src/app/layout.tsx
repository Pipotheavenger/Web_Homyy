import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/providers/QueryProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { DEBUG_MODE, DebugProvider } from '@/__debug__';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Hommy - Conectando Profesionales',
  description: 'Plataforma para conectar profesionales con clientes',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <QueryProvider>
          <AuthProvider>
            {DEBUG_MODE ? (
              <DebugProvider>{children}</DebugProvider>
            ) : (
              children
            )}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
