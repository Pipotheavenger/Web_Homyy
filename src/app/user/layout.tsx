'use client';
import { UserTypeProvider } from '@/contexts/UserTypeContext';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserTypeProvider initialUserType="user">
      {children}
    </UserTypeProvider>
  );
} 