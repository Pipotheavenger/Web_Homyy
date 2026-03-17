'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

interface PhoneVerificationStatus {
  isVerified: boolean | null;
  phone: string | null;
  userId: string | null;
  loading: boolean;
}

export const usePhoneVerificationStatus = (): PhoneVerificationStatus => {
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<PhoneVerificationStatus>({
    isVerified: null,
    phone: null,
    userId: null,
    loading: true,
  });

  useEffect(() => {
    const checkStatus = async () => {
      if (!user?.id) {
        setStatus({ isVerified: null, phone: null, userId: null, loading: false });
        return;
      }

      try {
        setStatus(prev => ({ ...prev, loading: true }));
        const { data, error } = await supabase
          .from('user_profiles')
          .select('user_id, movil_verificado, phone')
          .eq('user_id', user.id)
          .single();

        if (error || !data) {
          setStatus({ isVerified: null, phone: null, userId: user.id, loading: false });
          return;
        }

        setStatus({
          isVerified: data.movil_verificado ?? false,
          phone: data.phone || null,
          userId: data.user_id,
          loading: false,
        });
      } catch {
        setStatus(prev => ({ ...prev, loading: false }));
      }
    };

    if (authLoading) return;
    checkStatus();
  }, [authLoading, user?.id]);

  return status;
};
