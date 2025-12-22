import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { bookingsService, reviewsService } from '@/lib/services';
import { formatPrice, formatDate } from '@/lib/utils/empty-state-helpers';

export const useWorkerProfileCurrent = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('informacion');
  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState<any>(null);
  const [workerProfile, setWorkerProfile] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    ubicacion: '',
    profession: '',
    bio: '',
    experience_years: '',
    hourly_rate: ''
  });

  useEffect(() => {
    loadWorkerProfileData();
  }, []);

  const loadWorkerProfileData = async () => {
    try {
      // ✅ OPTIMIZACIÓN: Solo mostrar loading si no hay datos previos
      if (!usuario) {
        setLoading(true);
      }
      setError(null);

      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // ✅ OPTIMIZACIÓN: Cargar perfiles en paralelo (más rápido)
      const [userProfileResult, workerProfileResult] = await Promise.allSettled([
        // Cargar perfil básico del usuario (crítico)
        supabase
          .from('user_profiles')
          .select('id, user_id, name, email, phone, profile_picture_url, created_at, updated_at, user_type, birth_date, is_active, balance')
          .eq('user_id', user.id)
          .single(),
        
        // Cargar perfil de trabajador (puede no existir)
        supabase
          .from('worker_profiles')
          .select('*')
          .eq('user_id', user.id)
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

      // ✅ OPTIMIZACIÓN: Formatear y mostrar datos INMEDIATAMENTE
      const formattedUser = {
        id: userProfile.id,
        user_id: userProfile.user_id,
        name: userProfile.name || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        profile_picture_url: userProfile.profile_picture_url || '',
        created_at: userProfile.created_at,
        updated_at: userProfile.updated_at,
        user_type: userProfile.user_type,
        birth_date: userProfile.birth_date,
        is_active: userProfile.is_active,
        // Campos adicionales para compatibilidad
        location: workerData?.location || 'Bogotá, Colombia',
        calificacion: workerData?.rating || 0,
        serviciosCompletados: workerData?.total_services || 0,
        serviciosActivos: 0,
        balance: userProfile.balance || 0,
        preferencias: {
          notificaciones: true,
          emailMarketing: false,
          privacidad: true
        }
      };

      setUsuario(formattedUser);
      setWorkerProfile(workerData);

      // Actualizar formData INMEDIATAMENTE
      setFormData({
        nombre: userProfile.name?.split(' ')[0] || '',
        apellido: userProfile.name?.split(' ').slice(1).join(' ') || '',
        email: userProfile.email || '',
        telefono: userProfile.phone || '',
        ubicacion: workerData?.location || 'Bogotá, Colombia',
        profession: workerData?.profession || '',
        bio: workerData?.bio || '',
        experience_years: workerData?.experience_years?.toString() || '',
        hourly_rate: workerData?.hourly_rate?.toString() || ''
      });

      // ✅ Quitar loading lo antes posible
      setLoading(false);

      // ✅ OPTIMIZACIÓN: Cargar datos secundarios en segundo plano (no bloquea UI)
      Promise.allSettled([
        // Cargar bookings como trabajador
        bookingsService.getMyBookingsAsWorker().then((response) => {
          if (response.success && response.data) {
            setBookings(response.data.slice(0, 5));
          }
        }),
        
        // Cargar reviews recibidas - primero obtener el professional_id
        supabase
          .from('professionals')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle()
          .then(({ data: professional }) => {
            if (professional && professional.id) {
              return reviewsService.getByProfessional(professional.id);
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
  };

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

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
      setFormData({
        nombre: usuario.nombre || '',
        apellido: usuario.apellido || '',
        email: usuario.email || '',
        telefono: usuario.telefono || '',
        ubicacion: usuario.ubicacion || '',
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
