import { useState, useEffect } from 'react';
import { profileService, bookingsService, reviewsService } from '@/lib/services';
import { formatPrice, formatDate } from '@/lib/utils/empty-state-helpers';

export const useProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('informacion');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  
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
      bookingsService.getMyBookingsAsClient().then((bookingsResponse) => {
        if (bookingsResponse.success && bookingsResponse.data) {
          setBookings(bookingsResponse.data.slice(0, 5));
        }
      }).catch(err => {
        console.warn('Error cargando bookings:', err);
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
    loading,
    setIsEditing,
    setActiveTab,
    handleSave,
    handleCancel,
    handleInputChange,
    formatPrice,
    formatDate
  };
};
