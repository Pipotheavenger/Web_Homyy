import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { bookingsService, reviewsService } from '@/lib/services';
import { formatPrice, formatDate } from '@/lib/utils/empty-state-helpers';
import { useAuth } from '@/hooks/useAuth';

export const useWorkerProfileCurrent = () => {
  const { user, loading: authLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('informacion');
  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState<any>(null);
  const [workerProfile, setWorkerProfile] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [bookingStats, setBookingStats] = useState<{
    completed: number;
    in_progress: number;
    scheduled: number;
    cancelled: number;
  }>({
    completed: 0,
    in_progress: 0,
    scheduled: 0,
    cancelled: 0
  });
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    ubicacion: '',
    profession: '',
    bio: '',
    experience_years: '',
    hourly_rate: ''
  });

  const loadWorkerProfileData = useCallback(async () => {
    const currentUserId = user?.id;
    if (!currentUserId) {
      setUsuario(null);
      setWorkerProfile(null);
      setBookings([]);
      setReviews([]);
      setBookingStats({
        completed: 0,
        in_progress: 0,
        scheduled: 0,
        cancelled: 0
      });
      setError(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // ✅ OPTIMIZACIÓN: Cargar perfiles en paralelo (más rápido)
      const [userProfileResult, workerProfileResult] = await Promise.allSettled([
        // Cargar perfil básico del usuario (crítico)
        supabase
          .from('user_profiles')
          .select('id, user_id, name, phone, profile_picture_url, created_at, updated_at, user_type, birth_date, is_active, balance, movil_verificado, whatsapp_notifications_enabled')
          .eq('user_id', currentUserId)
          .single(),
        
        // Cargar perfil de trabajador (puede no existir)
        supabase
          .from('worker_profiles')
          .select('*')
          .eq('user_id', currentUserId)
          .maybeSingle()
      ]);

      // Procesar resultado del perfil de usuario
      if (userProfileResult.status === 'rejected' || !userProfileResult.value.data) {
        const error = userProfileResult.status === 'rejected' 
          ? userProfileResult.reason 
          : userProfileResult.value.error;
        console.error('Error cargando perfil de usuario:', error);
        throw new Error('Error al cargar perfil de usuario');
      }

      const userProfile = userProfileResult.value.data;
      const workerData = workerProfileResult.status === 'fulfilled' && workerProfileResult.value.data
        ? workerProfileResult.value.data
        : null;

      // Si hay total_services en worker_profiles, usarlo como referencia
      // pero también cargaremos los bookings para estadísticas precisas

      // ✅ OPTIMIZACIÓN: Formatear y mostrar datos INMEDIATAMENTE
      const formattedUser = {
        id: userProfile.id,
        user_id: userProfile.user_id,
        name: userProfile.name || '',
        phone: userProfile.phone || '',
        profile_picture_url: userProfile.profile_picture_url || '',
        created_at: userProfile.created_at,
        updated_at: userProfile.updated_at,
        user_type: userProfile.user_type,
        birth_date: userProfile.birth_date,
        is_active: userProfile.is_active,
        balance: userProfile.balance || 0,
        movil_verificado: userProfile.movil_verificado || false,
        whatsapp_notifications_enabled: workerData?.whatsapp_notifications_enabled ?? true
      };

      setUsuario(formattedUser);
      setWorkerProfile(workerData);

      // Actualizar formData INMEDIATAMENTE
      setFormData({
        nombre: userProfile.name?.split(' ')[0] || '',
        apellido: userProfile.name?.split(' ').slice(1).join(' ') || '',
        telefono: userProfile.phone || '',
        ubicacion: workerData?.location || 'Bogotá, Colombia',
        profession: workerData?.profession || '',
        bio: workerData?.bio || '',
        experience_years: workerData?.experience_years?.toString() || '',
        hourly_rate: workerData?.hourly_rate?.toString() || ''
      });

      // Inicializar estadísticas con total_services del perfil si está disponible
      // Esto asegura que se muestre el número correcto mientras se cargan los bookings
      if (workerData?.total_services !== undefined && workerData.total_services > 0) {
        setBookingStats({
          completed: workerData.total_services,
          in_progress: 0,
          scheduled: 0,
          cancelled: 0
        });
      }

      // ✅ Quitar loading lo antes posible
      setLoading(false);

      // ✅ OPTIMIZACIÓN: Cargar datos secundarios en segundo plano (no bloquea UI)
      Promise.allSettled([
        // Cargar bookings como trabajador
        bookingsService.getMyBookingsAsWorker().then(async (response) => {
          if (response.success && response.data) {
            // Guardar todos los bookings para estadísticas
            const allBookings = response.data || [];
            setBookings(allBookings.slice(0, 5)); // Solo mostrar 5 recientes en UI
            
            // Calcular estadísticas de todos los bookings
            const stats = {
              completed: allBookings.filter((b: any) => b.status === 'completed').length,
              in_progress: allBookings.filter((b: any) => b.status === 'in_progress').length,
              scheduled: allBookings.filter((b: any) => b.status === 'scheduled').length,
              cancelled: allBookings.filter((b: any) => b.status === 'cancelled').length
            };
            
            // También contar servicios completados desde escrow_transactions (más confiable)
            // porque algunos servicios pueden estar marcados como "deleted" pero tener escrow completado
            try {
              const { data: completedEscrows } = await supabase
                .from('escrow_transactions')
                .select('service_id')
                .eq('worker_id', currentUserId)
                .eq('status', 'completada');
              
              if (completedEscrows && completedEscrows.length > 0) {
                // Usar el máximo entre bookings completados y escrows completados
                stats.completed = Math.max(stats.completed, completedEscrows.length);
              }
            } catch (err) {
              console.warn('Error contando escrows completados:', err);
            }
            
            // También contar servicios completados desde applications (puede que algunos servicios se completen sin booking)
            try {
              const { data: completedServices } = await supabase
                .from('services')
                .select(`
                  id,
                  applications!inner(
                    worker_id,
                    status
                  )
                `)
                .eq('status', 'completed')
                .neq('status', 'deleted')
                .eq('applications.worker_id', currentUserId)
                .eq('applications.status', 'accepted');
              
              if (completedServices && completedServices.length > 0) {
                // Usar el máximo entre todos los métodos de conteo
                stats.completed = Math.max(stats.completed, completedServices.length);
              }
            } catch (err) {
              console.warn('Error contando servicios completados:', err);
            }
            
            // Si aún es 0, usar total_services del perfil como respaldo (debe ser la fuente más confiable)
            if (stats.completed === 0 && workerData?.total_services > 0) {
              stats.completed = workerData.total_services;
            } else if (stats.completed > 0 && workerData?.total_services !== stats.completed) {
              // Si hay discrepancia, usar el máximo entre ambos
              stats.completed = Math.max(stats.completed, workerData?.total_services || 0);
            }
            
            setBookingStats(stats);
          } else {
            // Si falla cargar bookings, intentar contar desde servicios completados
            try {
              const { data: completedServices } = await supabase
                .from('services')
                .select(`
                  id,
                  applications!inner(
                    worker_id,
                    status
                  )
                `)
                .eq('status', 'completed')
                .neq('status', 'deleted')
                .eq('applications.worker_id', currentUserId)
                .eq('applications.status', 'accepted');
              
              const fallbackStats = {
                completed: completedServices?.length || workerData?.total_services || 0,
                in_progress: 0,
                scheduled: 0,
                cancelled: 0
              };
              setBookingStats(fallbackStats);
            } catch (err) {
              // Último recurso: usar total_services del perfil
              setBookingStats({
                completed: workerData?.total_services || 0,
                in_progress: 0,
                scheduled: 0,
                cancelled: 0
              });
            }
          }
        }),
        
        // Cargar reviews recibidas - usar el worker_profile_id
        supabase
          .from('worker_profiles')
          .select('id')
          .eq('user_id', currentUserId)
          .maybeSingle()
          .then(({ data: workerProfile }) => {
            if (workerProfile && workerProfile.id) {
              return reviewsService.getByProfessional(workerProfile.id);
            }
            return { success: true, data: [], error: null };
          })
          .then((response) => {
            if (response.success && response.data) {
              setReviews(response.data);
            }
          })
      ]).catch(err => {
        console.warn('Error cargando datos secundarios:', err);
      });

    } catch (err: any) {
      console.error('Error cargando perfil de trabajador:', err);
      setError(err.message || 'Error al cargar el perfil');
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (authLoading) return;
    void loadWorkerProfileData();
  }, [authLoading, loadWorkerProfileData]);

  const handleSave = async () => {
    try {
      if (!user?.id) throw new Error('Usuario no autenticado');

      const fullName = `${formData.nombre} ${formData.apellido}`.trim();
      
      // Actualizar perfil básico
      const { error: userError } = await supabase
        .from('user_profiles')
        .update({
          name: fullName,
          phone: formData.telefono
        })
        .eq('user_id', user.id);

      if (userError) throw userError;

      // Actualizar perfil de trabajador
      const workerUpdateData = {
        location: formData.ubicacion,
        profession: formData.profession,
        bio: formData.bio,
        experience_years: formData.experience_years ? parseInt(formData.experience_years) : null,
        hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null
      };

      const { error: workerError } = await supabase
        .from('worker_profiles')
        .update(workerUpdateData)
        .eq('user_id', user.id);

      if (workerError) throw workerError;

      await loadWorkerProfileData();
      setIsEditing(false);
      alert('Perfil actualizado exitosamente');

    } catch (error: any) {
      console.error('Error actualizando perfil:', error);
      alert('Error al actualizar el perfil: ' + error.message);
    }
  };

  const handleCancel = () => {
    if (usuario) {
      const nameParts = (usuario.name || '').split(' ');
      setFormData({
        nombre: nameParts[0] || '',
        apellido: nameParts.slice(1).join(' ') || '',
        telefono: usuario.phone || '',
        ubicacion: workerProfile?.location || '',
        profession: workerProfile?.profession || '',
        bio: workerProfile?.bio || '',
        experience_years: workerProfile?.experience_years?.toString() || '',
        hourly_rate: workerProfile?.hourly_rate?.toString() || ''
      });
    }
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Calcular estadísticas de reseñas
  const reviewStats = reviews.length > 0 ? {
    averageRating: reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length,
    totalReviews: reviews.length,
    satisfaction: Math.round((reviews.filter(r => Number(r.rating) >= 4).length / reviews.length) * 100)
  } : {
    averageRating: 0,
    totalReviews: 0,
    satisfaction: 0
  };

  return {
    usuario,
    workerProfile,
    formData,
    isEditing,
    activeTab,
    serviciosRecientes: bookings || [],
    reviews: reviews || [],
    reviewStats,
    bookingStats,
    loading,
    error,
    setIsEditing,
    setActiveTab,
    handleSave,
    handleCancel,
    handleInputChange,
    formatPrice,
    formatDate,
    loadWorkerProfileData
  };
};
