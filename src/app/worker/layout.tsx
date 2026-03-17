'use client';
import { UserTypeProvider } from '@/contexts/UserTypeContext';
import { WorkerOnlyRoute } from '@/components/ProtectedRoute';

export default function WorkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserTypeProvider initialUserType="worker">
      <WorkerOnlyRoute>{children}</WorkerOnlyRoute>
    </UserTypeProvider>
  );
} 