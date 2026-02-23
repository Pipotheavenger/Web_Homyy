'use client';
import { 
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  LogOut,
  User,
  Edit3,
  Save,
  X,
  Star,
  CheckCircle,
  DollarSign,
  Clock,
  Briefcase,
  Camera,
  XCircle,
  MessageCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function PerfilPage() {
  const router = useRouter();
  const {
    usuario,
    formData,
    isEditing,
    activeTab,
    serviciosRecientes,
    bookingStats,
    reviews,
    loading,
    setIsEditing,
    setActiveTab,
    handleSave,
    handleCancel,
    handleInputChange,
    formatPrice,
    formatDate,
    loadProfileData
  } = useProfile();
  
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useState<HTMLInputElement | null>(null)[0];
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [updatingWhatsapp, setUpdatingWhatsapp] = useState(false);

  // Debug: Log cuando cambian los datos
  useEffect(() => {
    console.log('🔍 serviciosRecientes:', serviciosRecientes?.length || 0, serviciosRecientes);
    console.log('🔍 bookingStats:', bookingStats);
    console.log('🔍 reviews:', reviews?.length || 0);
  }, [serviciosRecientes, bookingStats, reviews]);

  // Cargar preferencia de WhatsApp cuando cambia el usuario
  useEffect(() => {
    if (usuario) {
      setWhatsappEnabled(usuario.whatsapp_notifications_enabled ?? false);
    }
  }, [usuario]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen debe ser menor a 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Crear un nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `profile-pictures/${user.id}/${Date.now()}.${fileExt}`;

      // Subir imagen a Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('user-uploads')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true // Permitir sobrescribir si ya existe
        });

      if (uploadError) {
        console.error('Error subiendo imagen:', uploadError);
        alert('Error al subir la imagen. Por favor intenta de nuevo.');
        return;
      }

      // Obtener URL pública de la imagen
      const { data: { publicUrl } } = supabase.storage
        .from('user-uploads')
        .getPublicUrl(fileName);

      // Actualizar el perfil con la nueva URL de la imagen
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ profile_picture_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error actualizando perfil:', updateError);
        alert('Error al actualizar el perfil. Por favor intenta de nuevo.');
        return;
      }

      // Recargar los datos del perfil
      await loadProfileData();
      alert('Foto de perfil actualizada exitosamente');
    } catch (err: any) {
      console.error('Error:', err);
      alert('Error al subir la imagen: ' + err.message);
    } finally {
      setUploadingImage(false);
      // Limpiar el input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleLogout = async () => {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      try {
        await supabase.auth.signOut();
        router.push('/login');
      } catch (error) {
        alert('Error al cerrar sesión');
      }
    }
  };

  const handleBack = () => {
    router.push('/dashboard');
  };

  // Skeleton mientras carga
  const ProfileSkeleton = () => (
    <div className="p-4 md:p-6 space-y-6 animate-pulse">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-6">
          <div className="w-24 h-24 bg-gray-300 rounded-2xl"></div>
          <div className="flex-1 space-y-3">
            <div className="h-6 bg-gray-300 rounded w-48"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading && !usuario) {
    return (
      <Layout 
        title="Mi Perfil" 
        currentPage="perfil"
      >
        <ProfileSkeleton />
      </Layout>
    );
  }

  if (!usuario && !loading) {
    return (
      <Layout 
        title="Mi Perfil" 
        currentPage="perfil"
      >
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600">
            <h3 className="font-semibold mb-2">Error al cargar el perfil</h3>
            <p className="mb-4">Usuario no encontrado</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'completed':
        return 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200';
      case 'in_progress':
        return 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border-blue-200';
      case 'scheduled':
        return 'bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-700 border-yellow-200';
      case 'cancelled':
        return 'bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border-red-200';
      default:
        return 'bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <Layout 
      title="Mi Perfil" 
      breadcrumbs={[
        { label: 'Inicio', href: '/dashboard' },
        { label: 'Mi Perfil', active: true }
      ]}
      showBackButton={true}
      onBackClick={handleBack}
      currentPage="perfil"
    >
      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header Hero Section */}
        <div className="relative bg-gradient-to-br from-[#743fc6] via-purple-400 to-[#8a5fd1] rounded-3xl shadow-xl overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative p-6 md:p-10">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-28 h-28 md:w-32 md:h-32 bg-white rounded-2xl flex items-center justify-center shadow-2xl ring-4 ring-white/50 overflow-hidden">
                  {usuario?.foto ? (
                    <img
                      src={usuario.foto}
                      alt={usuario.nombre}
                      className="w-full h-full rounded-2xl object-cover"
                    />
                  ) : (
                    <span className="text-3xl md:text-4xl font-bold text-purple-600">
                      {usuario?.nombre?.[0]?.toUpperCase() || 'U'}
                    </span>
                  )}
                  {uploadingImage && (
                    <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e) => {
                      const event = e as unknown as React.ChangeEvent<HTMLInputElement>;
                      handleImageUpload(event);
                    };
                    input.click();
                  }}
                  disabled={uploadingImage}
                  className="absolute bottom-0 right-0 bg-purple-500 text-white p-2 rounded-full shadow-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Cambiar foto de perfil"
                >
                  <Camera size={16} />
                </button>
              </div>

              {/* Información Principal */}
              <div className="flex-1 text-center lg:text-left text-white">
                <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold">{usuario?.nombre} {usuario?.apellido || ''}</h1>
                  <CheckCircle className="text-yellow-300" size={28} />
                </div>
                <p className="text-xl md:text-2xl text-purple-50 mb-4">Cliente</p>
                
                {/* Stats */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 md:gap-6">
                  {usuario?.balance !== undefined && (
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                      <DollarSign size={18} />
                      <span className="font-semibold">{formatPrice(Number(usuario.balance))}</span>
                    </div>
                  )}
                  
                  {usuario?.ubicacion && (
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                      <MapPin size={18} />
                      <span>{usuario.ubicacion}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex gap-3">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-white text-purple-600 px-4 md:px-6 py-2.5 rounded-xl font-semibold hover:bg-purple-50 transition-all shadow-lg flex items-center gap-2"
                  >
                    <Edit3 size={18} />
                    <span className="hidden sm:inline">Editar Perfil</span>
                    <span className="sm:hidden">Editar</span>
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="bg-white text-purple-600 px-4 py-2.5 rounded-xl font-semibold hover:bg-purple-50 transition-all shadow-lg flex items-center gap-2"
                    >
                      <Save size={18} />
                      <span className="hidden sm:inline">Guardar</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="bg-white/20 backdrop-blur-sm text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-white/30 transition-all flex items-center gap-2"
                    >
                      <X size={18} />
                      <span className="hidden sm:inline">Cancelar</span>
                    </button>
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-red-600 transition-all shadow-lg flex items-center gap-2"
                >
                  <LogOut size={18} />
                  <span className="hidden sm:inline">Salir</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Métricas Rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-600">Completados</p>
                <p className="text-2xl font-bold text-gray-900">{bookingStats?.completed || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Clock className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-600">En Proceso</p>
                <p className="text-2xl font-bold text-gray-900">{bookingStats?.in_progress || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Briefcase className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-600">Total Servicios</p>
                <p className="text-2xl font-bold text-gray-900">
                  {serviciosRecientes?.length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Star className="text-yellow-600" size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-600">Reseñas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reviews?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs de Navegación */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100">
            <div className="flex flex-wrap gap-2 p-4">
              {[
                { id: 'informacion', label: 'Información', icon: User },
                { id: 'servicios', label: 'Servicios', icon: Briefcase },
                { id: 'reseñas', label: 'Reseñas', icon: Star }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all font-medium ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon size={18} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Tab: Información Personal */}
            {activeTab === 'informacion' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Información Personal */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <User className="text-purple-600" size={24} />
                      Información Personal
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="p-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl border border-gray-100">
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Nombre Completo</label>
                        {isEditing ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={formData.nombre}
                              onChange={(e) => handleInputChange('nombre', e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="Nombre"
                            />
                            <input
                              type="text"
                              value={formData.apellido}
                              onChange={(e) => handleInputChange('apellido', e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="Apellido"
                            />
                          </div>
                        ) : (
                          <p className="text-lg font-semibold text-gray-900">{usuario?.nombre} {usuario?.apellido || ''}</p>
                        )}
                      </div>

                      <div className="p-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl border border-gray-100">
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 flex items-center gap-2">
                          <Mail size={14} />
                          Email
                        </label>
                        <p className="text-base text-gray-900 break-all">{usuario?.email || 'No disponible'}</p>
                      </div>

                      <div className="p-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl border border-gray-100">
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 flex items-center gap-2">
                          <Phone size={14} />
                          Teléfono
                        </label>
                        {isEditing ? (
                          <input
                            type="tel"
                            value={formData.telefono}
                            onChange={(e) => handleInputChange('telefono', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="+57 300 123 4567"
                          />
                        ) : (
                          <p className="text-base text-gray-900">{usuario?.telefono || 'No disponible'}</p>
                        )}
                      </div>

                      <div className="p-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl border border-gray-100">
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 flex items-center gap-2">
                          <MapPin size={14} />
                          Ubicación
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={formData.ubicacion}
                            onChange={(e) => handleInputChange('ubicacion', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Ciudad, País"
                          />
                        ) : (
                          <p className="text-base text-gray-900">{usuario?.ubicacion || 'No disponible'}</p>
                        )}
                      </div>

                      <div className="p-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl border border-gray-100">
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 flex items-center gap-2">
                          <Calendar size={14} />
                          Miembro desde
                        </label>
                        <p className="text-base text-gray-900">
                          {usuario?.fechaRegistro ? new Date(usuario.fechaRegistro).toLocaleDateString('es-CO', { 
                            day: 'numeric',
                            month: 'long', 
                            year: 'numeric' 
                          }) : 'Fecha no disponible'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Estado y Verificación */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Shield className="text-purple-600" size={24} />
                      Estado de Cuenta
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Verificación</label>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="text-green-600" size={20} />
                              <span className="font-semibold text-gray-900">Cuenta Verificada</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Toggle de Notificaciones WhatsApp - Siempre visible */}
                      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block flex items-center gap-2">
                                <MessageCircle size={14} />
                                Notificaciones por WhatsApp
                              </label>
                              <p className="text-sm text-gray-600 mt-1">
                                Recibe notificaciones importantes por WhatsApp
                              </p>
                            </div>
                            <button
                              onClick={async () => {
                                if (updatingWhatsapp) return;
                                setUpdatingWhatsapp(true);
                                const newValue = !whatsappEnabled;
                                
                                try {
                                  const { data: { user } } = await supabase.auth.getUser();
                                  if (!user) return;

                                  const { error } = await supabase
                                    .from('user_profiles')
                                    .update({ whatsapp_notifications_enabled: newValue })
                                    .eq('user_id', user.id);

                                  if (error) {
                                    console.error('Error actualizando preferencia de WhatsApp:', error);
                                    alert('Error al actualizar la preferencia');
                                  } else {
                                    setWhatsappEnabled(newValue);
                                    await loadProfileData(true);
                                  }
                                } catch (error) {
                                  console.error('Error:', error);
                                  alert('Error al actualizar la preferencia');
                                } finally {
                                  setUpdatingWhatsapp(false);
                                }
                              }}
                              disabled={updatingWhatsapp}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                                whatsappEnabled ? 'bg-green-500' : 'bg-gray-300'
                              } ${updatingWhatsapp ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  whatsappEnabled ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Balance Actual</label>
                        <p className="text-3xl font-bold text-purple-600">{formatPrice(Number(usuario?.balance || 0))}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Servicios */}
            {activeTab === 'servicios' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Briefcase className="text-purple-600" size={24} />
                  Mis Servicios Contratados
                </h3>
                
                <div className="space-y-4">
                  {serviciosRecientes && serviciosRecientes.length > 0 ? (
                    serviciosRecientes.map((booking: any) => (
                      <div key={booking.id} className="p-5 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-3">
                          <h4 className="font-semibold text-gray-900 text-lg break-words">
                            {booking.service?.title || (booking.service_id ? `Servicio ${booking.service_id.substring(0, 8)}...` : 'Servicio')}
                          </h4>
                          <div className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-medium border ${getEstadoColor(booking.status)}`}>
                            {booking.status === 'completed' ? 'Completado' : 
                             booking.status === 'in_progress' ? 'En Progreso' : 
                             booking.status === 'scheduled' ? 'Agendado' : 'Cancelado'}
                          </div>
                        </div>
                        
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between text-sm text-gray-600 gap-2">
                          <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 space-y-1 lg:space-y-0">
                            <span className="font-medium">Trabajador: {booking.worker?.name || 'N/A'}</span>
                            <span className="font-medium">Fecha: {booking.start_date || 'N/A'}</span>
                          </div>
                          <span className="font-bold text-purple-600 text-lg">{formatPrice(Number(booking.total_price || 0))}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                      <Briefcase className="mx-auto text-gray-400 mb-4" size={48} />
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Aún no has contratado servicios</h4>
                      <p className="text-gray-600">Explora los servicios disponibles y contrata tu primer trabajador</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Reseñas */}
            {activeTab === 'reseñas' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Star className="text-purple-600" size={24} />
                  Mis Reseñas
                </h3>
                
                <div className="space-y-4">
                  {reviews && reviews.length > 0 ? (
                    reviews.map((review: any) => (
                      <div key={review.id} className="p-5 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                            {review.service?.title ? (
                              <span className="text-white font-bold text-sm">
                                {review.service.title.substring(0, 2).toUpperCase()}
                              </span>
                            ) : (
                              <Star className="text-white" size={20} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 break-words">
                                  {review.service?.title || (review.service_id ? `Servicio ${review.service_id.substring(0, 8)}...` : 'Servicio')}
                                </h4>
                                {review.professional?.worker_profile?.profession && (
                                  <p className="text-sm text-gray-600">
                                    {review.professional.worker_profile.profession}
                                  </p>
                                )}
                              </div>
                              <span className="text-sm text-gray-500 flex-shrink-0">
                                {formatDate(review.created_at)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 mb-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star} 
                                  size={16} 
                                  className={star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} 
                                />
                              ))}
                            </div>
                            {review.comment && (
                              <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                      <Star className="mx-auto text-gray-400 mb-4" size={48} />
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Aún no has dejado reseñas</h4>
                      <p className="text-gray-600">Completa un servicio para dejar una calificación</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </Layout>
  );
}
