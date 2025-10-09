import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { workerService, reviewsService } from '@/lib/services';

export const useWorkerProfile = (workerId: string) => {
  const [worker, setWorker] = useState<any>(null);
  const [workerProfile, setWorkerProfile] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (workerId) {
      loadWorkerData();
    } else {
      setLoading(false);
    }
  }, [workerId]);

  const loadWorkerData = async () => {
    if (!workerId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Buscando usuario con ID:', workerId);

      // Cargar datos básicos del usuario desde user_profiles
      const { data: userProfile, error: userError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', workerId)
        .maybeSingle();

      console.log('📊 Resultado de user_profiles:', { userProfile, userError });

      if (userError) {
        console.log('❌ Error en query:', userError);
        throw new Error(`Error en la consulta: ${userError.message || 'Error desconocido'}`);
      }

      if (!userProfile) {
        console.log('⚠️ Usuario no encontrado en user_profiles para ID:', workerId);
        throw new Error('Usuario no encontrado en la base de datos');
      }

      console.log('✅ Usuario encontrado:', userProfile.name);
      setWorker(userProfile);

      // Intentar cargar perfil de trabajador (opcional)
      const { data: workerData } = await supabase
        .from('worker_profiles')
        .select('*')
        .eq('user_id', workerId)
        .maybeSingle();

      if (workerData) {
        setWorkerProfile(workerData);
      }

      // Cargar reseñas
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select(`
          *,
          client:user_profiles!reviews_client_id_fkey(name),
          service:services(title)
        `)
        .eq('professional_id', workerId)
        .order('created_at', { ascending: false });

      if (reviewsData) {
        setReviews(reviewsData);
      }

    } catch (err: any) {
      setError(err.message || 'Error al cargar el perfil');
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Hace un momento';
    if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} minutos`;
    if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} horas`;
    if (seconds < 2592000) return `Hace ${Math.floor(seconds / 86400)} días`;
    return `Hace ${Math.floor(seconds / 2592000)} meses`;
  };

  // Función helper para generar clases de estrellas
  const getStarClass = (index: number, rating: number) => {
    return `w-4 h-4 ${
      index < Math.floor(rating) 
        ? 'text-yellow-400 fill-current' 
        : index < rating 
          ? 'text-yellow-400 fill-current' 
          : 'text-gray-300'
    }`;
  };

  // Calcular estadísticas de reseñas
  const reviewStats = reviews.length > 0 ? {
    averageRating: reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length,
    totalReviews: reviews.length,
    ratingDistribution: {
      5: reviews.filter(r => Number(r.rating) === 5).length,
      4: reviews.filter(r => Number(r.rating) === 4).length,
      3: reviews.filter(r => Number(r.rating) === 3).length,
      2: reviews.filter(r => Number(r.rating) === 2).length,
      1: reviews.filter(r => Number(r.rating) === 1).length,
    }
  } : {
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  };

  return {
    worker,
    workerProfile,
    reviews,
    recentBookings,
    reviewStats,
    loading,
    error,
    formatPrice,
    formatDate,
    getTimeAgo,
    getStarClass,
    loadWorkerData
  };
};