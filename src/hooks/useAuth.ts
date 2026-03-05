'use client';

// Re-export useAuth from AuthContext for backward compatibility.
// All consumers continue to import from '@/hooks/useAuth'.
export { useAuth } from '@/contexts/AuthContext';
export type { UserProfile } from '@/lib/auth-utils';
