'use client';
import { UserTypeProvider } from '@/contexts/UserTypeContext';

export default function WorkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserTypeProvider initialUserType="worker">
      {children}
    </UserTypeProvider>
  );
} 