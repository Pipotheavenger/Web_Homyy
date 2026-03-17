'use client';
import { UserTypeProvider } from '@/contexts/UserTypeContext';
import { UserOnlyRoute } from '@/components/ProtectedRoute';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserTypeProvider initialUserType="user">
      <UserOnlyRoute>{children}</UserOnlyRoute>
    </UserTypeProvider>
  );
} 