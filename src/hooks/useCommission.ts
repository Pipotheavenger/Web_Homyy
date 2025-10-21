import { useState, useEffect } from 'react';
import { adminService } from '@/lib/services';

export const useCommission = () => {
  const [commissionPercentage, setCommissionPercentage] = useState<number>(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCommissionPercentage();
  }, []);

  const loadCommissionPercentage = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await adminService.getCommissionPercentage();
      
      if (response.success && response.data !== null) {
        setCommissionPercentage(response.data);
      } else {
        setCommissionPercentage(10);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al cargar comisión');
      // Usar valor por defecto en caso de error
      setCommissionPercentage(10);
    } finally {
      setLoading(false);
    }
  };

  const calculateInflatedPrice = (originalPrice: number): number => {
    return originalPrice * (1 + commissionPercentage / 100);
  };

  const calculateCommissionAmount = (originalPrice: number): number => {
    return originalPrice * (commissionPercentage / 100);
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  return {
    commissionPercentage,
    loading,
    error,
    calculateInflatedPrice,
    calculateCommissionAmount,
    formatPrice,
    refreshCommission: loadCommissionPercentage
  };
};
