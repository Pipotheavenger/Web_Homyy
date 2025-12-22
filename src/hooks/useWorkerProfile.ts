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

      console.log('🔍 Buscando trabajador con ID:', workerId);

      // Primero intentar buscar por ID directo en user_profiles
      let { data: userProfile, error: userError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', workerId)
        .maybeSingle();

      // Si no se encuentra por ID, intentar por user_id
      if (!userProfile) {
        const { data: userProfileByUserId, error: userErrorByUserId } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', workerId)
          .maybeSingle();
        
        userProfile = userProfileByUserId;
        userError = userErrorByUserId;
      }

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

      // Cargar perfil de trabajador usando el user_id correcto
      const { data: workerData } = await supabase
        .from('worker_profiles')
        .select('*')
        .eq('user_id', userProfile.user_id)
        .maybeSingle();

      if (workerData) {
        console.log('✅ Perfil de trabajador encontrado:', workerData);
        setWorkerProfile(workerData);
      } else {
        console.log('⚠️ No se encontró perfil de trabajador para:', userProfile.user_id);
      }

      // Obtener el professional_id desde la tabla professionals
      const { data: professional } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', userProfile.user_id)
        .maybeSingle();

      // Cargar reseñas usando el servicio que maneja mejor los errores
      if (professional && professional.id) {
        try {
          const reviewsResponse = await reviewsService.getByProfessional(professional.id);
          if (reviewsResponse.success && reviewsResponse.data) {
            setReviews(reviewsResponse.data);
            if (reviewsResponse.data.length > 0) {
              console.log('✅ Reseñas encontradas:', reviewsResponse.data.length);
            } else {
              console.log('ℹ️ No hay reseñas para este trabajador');
            }
          } else {
            // Si no hay éxito, establecer array vacío (caso normal cuando no hay reseñas)
            setReviews([]);
          }
        } catch (reviewLoadError) {
          // Si hay una excepción, simplemente establecer array vacío
          console.warn('⚠️ Error al cargar reseñas (no crítico):', reviewLoadError);
          setReviews([]);
        }
      } else {
        // Si no hay professional_id, no hay reseñas
        console.log('ℹ️ No se encontró professional_id, no hay reseñas');
        setReviews([]);
      }

    } catch (err: any) {
      console.error('❌ Error completo:', err);
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