'use client';
import { useState, useEffect, useCallback } from 'react';
import { serviceService } from '@/lib/services';

export const useTrabajos = () => {
  const [trabajos, setTrabajos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todas');

  const loadTrabajos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await serviceService.getAvailableServices();
      
      if (response.success && response.data) {
        setTrabajos(response.data);
        setError(null);
      } else {
        const errorMsg = response.error || 'Error desconocido al cargar trabajos';
        console.error('Error cargando trabajos:', errorMsg);
        setError(errorMsg);
        setTrabajos([]);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error al cargar trabajos';
      console.error('Excepción cargando trabajos:', errorMsg);
      setError(errorMsg);
      setTrabajos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrabajos();
  }, [loadTrabajos]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const filteredTrabajos = trabajos.filter(trabajo => {
    const matchesStatus = trabajo.status === 'active';
    const matchesSearch = 
      trabajo.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trabajo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trabajo.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'todas' || trabajo.category?.name === selectedCategory;
    
    return matchesStatus && matchesSearch && matchesCategory;
  });

  // Extraer categorías únicas de los trabajos
  const categorias = ['todas', ...Array.from(new Set(trabajos.map(t => t.category?.name).filter(Boolean)))];

  return {
    trabajos: filteredTrabajos,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    categorias,
    formatPrice,
    reload: loadTrabajos
  };
};

