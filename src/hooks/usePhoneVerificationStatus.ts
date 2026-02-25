'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface PhoneVerificationStatus {
  isVerified: boolean | null;
  phone: string | null;
  userId: string | null;
  loading: boolean;
}

export const usePhoneVerificationStatus = (): PhoneVerificationStatus => {
  const [status, setStatus] = useState<PhoneVerificationStatus>({
    isVerified: null,
    phone: null,
    userId: null,
    loading: true,
  });

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setStatus({ isVerified: null, phone: null, userId: null, loading: false });
          return;
        }

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

    checkStatus();
  }, []);

  return status;
};
