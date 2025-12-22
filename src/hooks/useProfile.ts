import { useState, useEffect } from 'react';
import { profileService, bookingsService, reviewsService } from '@/lib/services';
import { formatPrice, formatDate } from '@/lib/utils/empty-state-helpers';
import { supabase } from '@/lib/supabase';

export const useProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('informacion');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [bookingStats, setBookingStats] = useState({
    completed: 0,
    in_progress: 0,
    scheduled: 0,
    cancelled: 0
  });
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    ubicacion: ''
  });

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      // ✅ OPTIMIZACIÓN: Solo mostrar loading si no hay perfil previo
      if (profile === null) {
        setLoading(true);
      }
      
      // ✅ OPTIMIZACIÓN: Cargar perfil primero (crítico para mostrar UI)
      const profileResponse = await profileService.getProfile();
      if (profileResponse.success && profileResponse.data) {
        const data = profileResponse.data;
        const nameParts = (data.name || '').split(' ');
        
        const profileData = {
          id: data.id,
          nombre: nameParts[0] || '',
          apellido: nameParts.slice(1).join(' ') || '',
          email: data.email || '',
          telefono: data.phone || '',
          ubicacion: 'Bogotá, Colombia',
          fechaRegistro: data.created_at,
          foto: data.profile_picture_url || '',
          calificacion: 0,
          serviciosCompletados: 0,
          serviciosActivos: 0,
          balance: data.balance || 0, // ✅ Usar balance real de la BD
          movil_verificado: data.movil_verificado || false,
          preferencias: {
            notificaciones: true,
            emailMarketing: false,
            privacidad: true
          }
        };
        
        // ✅ Actualizar perfil INMEDIATAMENTE para mostrar UI
        setProfile(profileData);
        setFormData({
          nombre: nameParts[0] || '',
          apellido: nameParts.slice(1).join(' ') || '',
          email: data.email || '',
          telefono: data.phone || '',
          ubicacion: 'Bogotá, Colombia'
        });
        
        // ✅ Quitar loading lo antes posible
        setLoading(false);
      }

      // ✅ OPTIMIZACIÓN: Cargar bookings en segundo plano (no bloquea UI)
      // Obtener usuario primero para usar en todas las consultas
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      Promise.allSettled([
        // Cargar bookings como cliente (igual que trabajador)
        bookingsService.getMyBookingsAsClient().then(async (response) => {
          console.log('📊 Respuesta de getMyBookingsAsClient:', response);
          if (response.success && response.data) {
            // Guardar todos los bookings para estadísticas
            const allBookings = response.data || [];
            console.log('📊 Bookings cargados:', allBookings.length, allBookings);
            
            // Guardar TODOS los bookings (no solo 5) para estadísticas correctas
            setBookings(allBookings);
            
            // Calcular estadísticas de todos los bookings
            const stats = {
              completed: allBookings.filter((b: any) => b.status === 'completed').length,
              in_progress: allBookings.filter((b: any) => b.status === 'in_progress').length,
              scheduled: allBookings.filter((b: any) => b.status === 'scheduled').length,
              cancelled: allBookings.filter((b: any) => b.status === 'cancelled').length
            };
            
            console.log('📊 Stats iniciales desde bookings:', stats);
            
            // También contar servicios completados desde escrow_transactions (más confiable)
            // porque algunos servicios pueden estar marcados como "deleted" pero tener escrow completado
            try {
              // Obtener escrows completados para este cliente (igual que trabajador)
              const { data: completedEscrows } = await supabase
                .from('escrow_transactions')
                .select('service_id')
                .eq('client_id', user.id)
                .eq('status', 'completada');
              
              console.log('📊 Escrows completados encontrados:', completedEscrows?.length || 0);
              
              if (completedEscrows && completedEscrows.length > 0) {
                // Usar el máximo entre bookings completados y escrows completados
                stats.completed = Math.max(stats.completed, completedEscrows.length);
                console.log('📊 Stats actualizados con escrows:', stats);
              }
            } catch (err) {
              console.warn('Error contando escrows completados:', err);
            }
            
            console.log('📊 Stats finales guardados:', stats);
            setBookingStats(stats);
          } else {
            console.warn('❌ Error cargando bookings desde servicio:', response.error);
            // Si falla cargar bookings, intentar cargar directamente desde Supabase
            try {
              const { data: directBookings, error: directError } = await supabase
                .from('bookings')
                .select(`
                  *,
                  service:services(id, title, description, location),
                  worker:user_profiles!bookings_worker_id_fkey(id, name, email, phone, profile_picture_url)
                `)
                .eq('client_id', user.id)
                .order('start_date', { ascending: false });
              
              console.log('📊 Bookings directos desde Supabase:', directBookings?.length || 0, directError);
              
              if (!directError && directBookings) {
                // Guardar TODOS los bookings para estadísticas
                setBookings(directBookings);
                
                const stats = {
                  completed: directBookings.filter((b: any) => b.status === 'completed').length,
                  in_progress: directBookings.filter((b: any) => b.status === 'in_progress').length,
                  scheduled: directBookings.filter((b: any) => b.status === 'scheduled').length,
                  cancelled: directBookings.filter((b: any) => b.status === 'cancelled').length
                };
                
                console.log('📊 Stats iniciales (fallback):', stats);
                
                // También contar desde escrow_transactions
                try {
                  const { data: completedEscrows } = await supabase
                    .from('escrow_transactions')
                    .select('service_id')
                    .eq('client_id', user.id)
                    .eq('status', 'completada');
                  
                  console.log('📊 Escrows completados (fallback):', completedEscrows?.length || 0);
                  
                  if (completedEscrows && completedEscrows.length > 0) {
                    stats.completed = Math.max(stats.completed, completedEscrows.length);
                    console.log('📊 Stats actualizados con escrows (fallback):', stats);
                  }
                } catch (err) {
                  console.warn('Error contando escrows:', err);
                }
                
                setBookingStats(stats);
              }
            } catch (err) {
              console.error('Error cargando bookings directamente:', err);
            }
          }
        }),
        // Cargar reseñas que el usuario ha hecho (igual que trabajador)
        (async () => {
          if (user) {
            try {
              // Primero intentar con relaciones
              const { data: userReviews, error: reviewsError } = await supabase
                .from('reviews')
                .select(`
                  *,
                  service:services(id, title)
                `)
                .eq('reviewer_id', user.id)
                .order('created_at', { ascending: false });
              
              if (reviewsError) {
                console.warn('Error cargando reseñas con relaciones:', reviewsError);
                // Si falla, cargar sin relaciones y luego cargar servicios manualmente
                const { data: simpleReviews } = await supabase
                  .from('reviews')
                  .select('*')
                  .eq('reviewer_id', user.id)
                  .order('created_at', { ascending: false });
                
                if (simpleReviews && simpleReviews.length > 0) {
                  // Cargar servicios para cada reseña manualmente
                  const reviewsWithServices = await Promise.all(
                    simpleReviews.map(async (review: any) => {
                      const { data: serviceData } = await supabase
                        .from('services')
                        .select('id, title')
                        .eq('id', review.service_id)
                        .maybeSingle();
                      
                      return {
                        ...review,
                        service: serviceData || { id: review.service_id, title: null }
                      };
                    })
                  );
                  
                  setReviews(reviewsWithServices);
                }
              } else if (userReviews) {
                // Asegurar que todas las reseñas tengan el servicio cargado
                const reviewsWithServices = await Promise.all(
                  userReviews.map(async (review: any) => {
                    // Si no tiene servicio o no tiene título, cargarlo manualmente
                    if (!review.service || !review.service.title) {
                      const { data: serviceData } = await supabase
                        .from('services')
                        .select('id, title')
                        .eq('id', review.service_id)
                        .maybeSingle();
                      
                      return {
                        ...review,
                        service: serviceData || { id: review.service_id, title: null }
                      };
                    }
                    return review;
                  })
                );
                setReviews(reviewsWithServices);
              }
            } catch (err) {
              console.error('Error cargando reseñas:', err);
            }
          }
        })()
      ]).catch(err => {
        console.warn('Error cargando datos:', err);
      });

    } catch (error) {
      console.error('Error cargando perfil:', error);
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const fullName = `${formData.nombre} ${formData.apellido}`.trim();
      const response = await profileService.updateProfile({
        name: fullName,
        phone: formData.telefono
      });
      if (response.success) {
        await loadProfileData();
        setIsEditing(false);
        alert('Perfil actualizado exitosamente');
      }
    } catch (error) {
      alert('Error al actualizar el perfil');
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        nombre: profile.nombre || '',
        apellido: profile.apellido || '',
        email: profile.email || '',
        telefono: profile.telefono || '',
        ubicacion: profile.ubicacion || ''
      });
    }
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return {
    usuario: profile,
    formData,
    isEditing,
    activeTab,
    serviciosRecientes: bookings || [],
    reviews: reviews || [],
    bookingStats,
    loading,
    setIsEditing,
    setActiveTab,
    handleSave,
    handleCancel,
    handleInputChange,
    formatPrice,
    formatDate,
    loadProfileData
  };
};
