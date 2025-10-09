'use client';
import { useState, useEffect } from 'react';
import { serviceService } from '@/lib/services';

export const useTrabajos = () => {
  const [trabajos, setTrabajos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todas');

  useEffect(() => {
    loadTrabajos();
  }, []);

  const loadTrabajos = async () => {
    try {
      setLoading(true);
      const response = await serviceService.getAvailableServices();
      
      if (response.success && response.data) {
        setTrabajos(response.data);
      } else {
        setTrabajos([]);
      }
    } catch (error) {
      setTrabajos([]);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const filteredTrabajos = trabajos.filter(trabajo => {
    const matchesSearch = 
      trabajo.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trabajo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trabajo.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'todas' || trabajo.category?.name === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Extraer categorías únicas de los trabajos
  const categorias = ['todas', ...Array.from(new Set(trabajos.map(t => t.category?.name).filter(Boolean)))];

  return {
    trabajos: filteredTrabajos,
    loading,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    categorias,
    formatPrice
  };
};

