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
  Award,
  DollarSign,
  Clock,
  TrendingUp,
  Briefcase,
  Camera,
  Upload,
  Image as ImageIcon,
  XCircle,
  Plus,
  MessageCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { useWorkerProfileCurrent } from '@/hooks/useWorkerProfileCurrent';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
const PhoneVerificationModal = dynamic(
  () => import('@/components/ui/PhoneVerificationModal'),
  { ssr: false }
);
import { AlertTriangle, ArrowRight } from 'lucide-react';

export default function PerfilWorkerPage() {
  const router = useRouter();
  const {
    usuario,
    workerProfile,
    formData,
    isEditing,
    activeTab,
    serviciosRecientes,
    reviews,
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
  } = useWorkerProfileCurrent();

  const [portfolioImages, setPortfolioImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loadingPortfolio, setLoadingPortfolio] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [updatingWhatsapp, setUpdatingWhatsapp] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  const handlePhoneVerified = async () => {
    setShowVerifyModal(false);
    await loadWorkerProfileData();
  };

  // Cargar imágenes del portfolio al montar el componente
  useEffect(() => {
    const loadPortfolioImages = async () => {
      if (!usuario?.user_id) return;
      
      setLoadingPortfolio(true);
      try {
        const { data: files, error: listError } = await supabase.storage
          .from('worker-portfolio')
          .list(usuario.user_id, {
            limit: 100,
            offset: 0,
          });

        if (listError) {
          console.log('No se encontraron imágenes en el portfolio:', listError);
          setPortfolioImages([]);
          return;
        }

        if (files && files.length > 0) {
          // Obtener URLs públicas de las imágenes (máximo 5)
          const imageUrls = files
            .filter(file => file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i))
            .slice(0, 5) // Limitar a 5 imágenes
            .map(file => {
              const { data: { publicUrl } } = supabase.storage
                .from('worker-portfolio')
                .getPublicUrl(`${usuario.user_id}/${file.name}`);
              return publicUrl;
            });
          
          setPortfolioImages(imageUrls);
        }
      } catch (err) {
        console.error('Error cargando portfolio:', err);
        setPortfolioImages([]);
      } finally {
        setLoadingPortfolio(false);
      }
    };

    if (usuario?.user_id) {
      loadPortfolioImages();
    }
  }, [usuario?.user_id]);

  // Cargar preferencia de WhatsApp cuando cambia el usuario
  useEffect(() => {
    if (usuario) {
      setWhatsappEnabled(usuario.whatsapp_notifications_enabled ?? false);
    }
  }, [usuario]);

  const { signOut } = useAuth();

  const handleLogout = async () => {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      await signOut();
      router.push('/login');
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar cantidad máxima (5 imágenes)
    if (portfolioImages.length >= 5) {
      alert('Solo puedes tener máximo 5 imágenes en tu portfolio');
      return;
    }

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
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Subir imagen a Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('worker-portfolio')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Error subiendo imagen:', uploadError);
        alert('Error al subir la imagen. Por favor intenta de nuevo.');
        return;
      }

      // Obtener URL pública de la imagen
      const { data: { publicUrl } } = supabase.storage
        .from('worker-portfolio')
        .getPublicUrl(fileName);
      
      setPortfolioImages([...portfolioImages, publicUrl]);
      alert('Imagen agregada exitosamente');
    } catch (err: any) {
      console.error('Error:', err);
      alert('Error al subir la imagen: ' + err.message);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
      await loadWorkerProfileData();
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

  const handleRemoveImage = async (index: number) => {
    const imageUrl = portfolioImages[index];
    
    // Extraer el path del archivo desde la URL
    try {
      // La URL de Supabase Storage tiene el formato: https://...supabase.co/storage/v1/object/public/bucket-name/path
      const urlParts = imageUrl.split('/storage/v1/object/public/');
      if (urlParts.length === 2) {
        const pathParts = urlParts[1].split('/');
        const bucketName = pathParts[0];
        const filePath = pathParts.slice(1).join('/');
        
        // Eliminar del storage
        const { error: deleteError } = await supabase.storage
          .from(bucketName)
          .remove([filePath]);
        
        if (deleteError) {
          console.error('Error eliminando imagen del storage:', deleteError);
          // Continuar eliminando del estado aunque falle en storage
        }
      }
    } catch (err) {
      console.error('Error procesando eliminación:', err);
    }
    
    // Eliminar del estado
    setPortfolioImages(portfolioImages.filter((_, i) => i !== index));
  };

  const handleBack = () => {
    router.push('/worker/dashboard');
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={`${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-yellow-400'
            : 'text-gray-300'
        }`}
      />
    ));
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
        title="Mi Perfil Profesional" 
        currentPage="perfil"
      >
        <ProfileSkeleton />
      </Layout>
    );
  }

  if (error && !usuario) {
    return (
      <Layout 
        title="Mi Perfil Profesional" 
        currentPage="perfil"
      >
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600">
            <h3 className="font-semibold mb-2">Error al cargar el perfil</h3>
            <p className="mb-4">{error || 'Usuario no encontrado'}</p>
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

  return (
    <Layout 
      title="Mi Perfil Profesional" 
      breadcrumbs={[
        { label: 'Inicio', href: '/worker/dashboard' },
        { label: 'Mi Perfil', active: true }
      ]}
      showBackButton={true}
      onBackClick={handleBack}
      currentPage="perfil"
    >
      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header Hero Section */}
        <div className="relative bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 rounded-3xl shadow-xl overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative p-6 md:p-10">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-28 h-28 md:w-32 md:h-32 bg-white rounded-2xl flex items-center justify-center shadow-2xl ring-4 ring-white/50 overflow-hidden">
                  {usuario?.profile_picture_url ? (
                    <img
                      src={usuario.profile_picture_url}
                      alt={usuario.name}
                      className="w-full h-full rounded-2xl object-cover"
                    />
                  ) : (
                    <span className="text-3xl md:text-4xl font-bold text-emerald-600">
                      {usuario?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
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
                      handleProfilePictureUpload(event);
                    };
                    input.click();
                  }}
                  disabled={uploadingImage}
                  className="absolute bottom-0 right-0 bg-emerald-500 text-white p-2 rounded-full shadow-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Cambiar foto de perfil"
                >
                  <Camera size={16} />
                </button>
              </div>

              {/* Información Principal */}
              <div className="flex-1 text-center lg:text-left text-white">
                <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold">{usuario?.name || 'Usuario'}</h1>
                  {workerProfile?.is_verified && (
                    <CheckCircle className="text-yellow-300" size={28} />
                  )}
                </div>
                <p className="text-xl md:text-2xl text-emerald-50 mb-4">{workerProfile?.profession || 'Profesional'}</p>
                
                {/* Rating y Stats */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 md:gap-6">
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <div className="flex items-center">{renderStars(reviewStats.averageRating)}</div>
                    <span className="font-semibold">{reviewStats.averageRating > 0 ? reviewStats.averageRating.toFixed(1) : '0.0'}</span>
                    <span className="text-sm">({reviewStats.totalReviews})</span>
                  </div>
                  
                  {workerProfile?.experience_years && (
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                      <Award size={18} />
                      <span>{workerProfile.experience_years} años</span>
                    </div>
                  )}
                  
                  {workerProfile?.location && (
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                      <MapPin size={18} />
                      <span>{workerProfile.location}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex gap-3">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-white text-emerald-600 px-4 md:px-6 py-2.5 rounded-xl font-semibold hover:bg-emerald-50 transition-all shadow-lg flex items-center gap-2"
                  >
                    <Edit3 size={18} />
                    <span className="hidden sm:inline">Editar Perfil</span>
                    <span className="sm:hidden">Editar</span>
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="bg-white text-emerald-600 px-4 py-2.5 rounded-xl font-semibold hover:bg-emerald-50 transition-all shadow-lg flex items-center gap-2"
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
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="text-emerald-600" size={24} />
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
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Star className="text-yellow-600" size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-600">Calificación</p>
                <p className="text-2xl font-bold text-gray-900">{reviewStats.averageRating > 0 ? reviewStats.averageRating.toFixed(1) : '0.0'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-600">Balance</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${usuario?.balance ? Math.floor(usuario.balance).toLocaleString() : '0'}
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
                { id: 'profesional', label: 'Profesional', icon: Briefcase },
                { id: 'portfolio', label: 'Portfolio', icon: ImageIcon },
                { id: 'reseñas', label: 'Reseñas', icon: Star }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all font-medium ${
                    activeTab === tab.id
                      ? 'bg-emerald-600 text-white shadow-md'
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
                      <User className="text-emerald-600" size={24} />
                      Información Personal
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="p-4 bg-gradient-to-r from-gray-50 to-emerald-50 rounded-xl border border-gray-100">
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Nombre Completo</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={formData.nombre + ' ' + formData.apellido}
                            onChange={(e) => {
                              const parts = e.target.value.split(' ');
                              handleInputChange('nombre', parts[0] || '');
                              handleInputChange('apellido', parts.slice(1).join(' ') || '');
                            }}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          />
                        ) : (
                          <p className="text-lg font-semibold text-gray-900">{usuario?.name || 'No disponible'}</p>
                        )}
                      </div>

                      <div className="p-4 bg-gradient-to-r from-gray-50 to-emerald-50 rounded-xl border border-gray-100">
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 flex items-center gap-2">
                          <Mail size={14} />
                          Email
                        </label>
                        <p className="text-base text-gray-900 break-all">{usuario?.email || 'No disponible'}</p>
                      </div>

                      <div className="p-4 bg-gradient-to-r from-gray-50 to-emerald-50 rounded-xl border border-gray-100">
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 flex items-center gap-2">
                          <Phone size={14} />
                          Teléfono
                        </label>
                        {isEditing ? (
                          <input
                            type="tel"
                            value={formData.telefono}
                            onChange={(e) => handleInputChange('telefono', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="+57 300 123 4567"
                          />
                        ) : (
                          <p className="text-base text-gray-900">{usuario?.phone || 'No disponible'}</p>
                        )}
                      </div>

                      <div className="p-4 bg-gradient-to-r from-gray-50 to-emerald-50 rounded-xl border border-gray-100">
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 flex items-center gap-2">
                          <MapPin size={14} />
                          Ubicación
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={formData.ubicacion}
                            onChange={(e) => handleInputChange('ubicacion', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="Ciudad, País"
                          />
                        ) : (
                          <p className="text-base text-gray-900">{workerProfile?.location || usuario?.location || 'No disponible'}</p>
                        )}
                      </div>

                      <div className="p-4 bg-gradient-to-r from-gray-50 to-emerald-50 rounded-xl border border-gray-100">
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 flex items-center gap-2">
                          <Calendar size={14} />
                          Miembro desde
                        </label>
                        <p className="text-base text-gray-900">
                          {usuario?.created_at ? new Date(usuario.created_at).toLocaleDateString('es-CO', { 
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
                      <Shield className="text-emerald-600" size={24} />
                      Estado de Cuenta
                    </h3>

                    <div className="space-y-3">
                      {/* Verificación - Condicional */}
                      {usuario?.movil_verificado ? (
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
                      ) : (
                        <div className="p-5 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-200">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <AlertTriangle className="text-yellow-600" size={20} />
                            </div>
                            <div className="flex-1">
                              <span className="inline-block px-2 py-0.5 bg-yellow-200 text-yellow-800 text-xs font-bold rounded-md uppercase mb-2">
                                Pendiente
                              </span>
                              <h4 className="font-semibold text-gray-900 mb-1">Verificación de cuenta</h4>
                              <p className="text-sm text-gray-600 mb-3">
                                Verifica tu número de celular para activar notificaciones por WhatsApp y acceder a todas las funciones de Hommy.
                              </p>
                              <button
                                onClick={() => setShowVerifyModal(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
                              >
                                Verificar ahora
                                <ArrowRight size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Toggle de Notificaciones WhatsApp */}
                      <div className={`p-4 rounded-xl border ${!usuario?.movil_verificado ? 'bg-gray-50 border-gray-200 opacity-60' : 'bg-gradient-to-r from-gray-50 to-emerald-50 border-gray-200'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block flex items-center gap-2">
                              <MessageCircle size={14} />
                              Notificaciones por WhatsApp
                            </label>
                            <p className="text-sm text-gray-600 mt-1">
                              {!usuario?.movil_verificado
                                ? 'Verifica tu número de celular para activar esta opción'
                                : 'Recibe notificaciones importantes por WhatsApp'}
                            </p>
                          </div>
                          <button
                            onClick={async () => {
                              if (updatingWhatsapp) return;
                              if (!usuario?.movil_verificado) {
                                setShowVerifyModal(true);
                                return;
                              }
                              setUpdatingWhatsapp(true);
                              const newValue = !whatsappEnabled;

                              try {
                                const { data: { user } } = await supabase.auth.getUser();
                                if (!user) return;

                                const { error } = await supabase
                                  .from('worker_profiles')
                                  .update({ whatsapp_notifications_enabled: newValue })
                                  .eq('user_id', user.id);

                                if (error) {
                                  console.error('Error actualizando preferencia de WhatsApp:', error);
                                  alert('Error al actualizar la preferencia');
                                } else {
                                  setWhatsappEnabled(newValue);
                                  await loadWorkerProfileData();
                                }
                              } catch (error) {
                                console.error('Error:', error);
                                alert('Error al actualizar la preferencia');
                              } finally {
                                setUpdatingWhatsapp(false);
                              }
                            }}
                            disabled={updatingWhatsapp || !usuario?.movil_verificado}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                              whatsappEnabled && usuario?.movil_verificado ? 'bg-green-500' : 'bg-gray-300'
                            } ${updatingWhatsapp || !usuario?.movil_verificado ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                whatsappEnabled && usuario?.movil_verificado ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Nivel de Satisfacción</label>
                        <div className="flex items-center gap-3">
                          <div className="text-3xl font-bold text-blue-600">{reviewStats.satisfaction}%</div>
                          <div className="flex-1">
                            <div className="w-full bg-blue-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${reviewStats.satisfaction}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Servicios Totales</label>
                        <p className="text-3xl font-bold text-purple-600">{workerProfile?.total_services || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Información Profesional */}
            {activeTab === 'profesional' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Información Profesional */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Briefcase className="text-emerald-600" size={24} />
                      Información Profesional
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Profesión</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={formData.profession}
                            onChange={(e) => handleInputChange('profession', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="Ej: Plomero, Electricista"
                          />
                        ) : (
                          <p className="text-lg font-semibold text-gray-900">{workerProfile?.profession || 'No especificado'}</p>
                        )}
                      </div>

                      <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 flex items-center gap-2">
                          <Award size={14} />
                          Años de Experiencia
                        </label>
                        {isEditing ? (
                          <input
                            type="number"
                            value={formData.experience_years}
                            onChange={(e) => handleInputChange('experience_years', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            min="0"
                            max="50"
                          />
                        ) : (
                          <p className="text-2xl font-bold text-blue-600">{workerProfile?.experience_years || 0} años</p>
                        )}
                      </div>

                      {workerProfile?.hourly_rate && (
                        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                          <label className="text-xs font-semibold text-gray-500 uppercase mb-1 flex items-center gap-2">
                            <DollarSign size={14} />
                            Tarifa por Hora
                          </label>
                          {isEditing ? (
                            <input
                              type="number"
                              value={formData.hourly_rate}
                              onChange={(e) => handleInputChange('hourly_rate', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                              placeholder="0"
                            />
                          ) : (
                            <p className="text-2xl font-bold text-green-600">{formatPrice(Number(workerProfile.hourly_rate))}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bio y Categorías */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <User className="text-emerald-600" size={24} />
                      Descripción y Especialidades
                    </h3>
                    
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                      <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Biografía Profesional</label>
                      {isEditing ? (
                        <textarea
                          value={formData.bio}
                          onChange={(e) => handleInputChange('bio', e.target.value)}
                          rows={6}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                          placeholder="Describe tu experiencia, especialidades y servicios que ofreces..."
                        />
                      ) : (
                        <p className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {workerProfile?.bio || workerProfile?.profile_description || 'No hay descripción disponible'}
                        </p>
                      )}
                    </div>

                    {/* Categorías */}
                    {workerProfile?.categories && workerProfile.categories.length > 0 && (
                      <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200">
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-3 block">Categorías de Servicio</label>
                        <div className="flex flex-wrap gap-2">
                          {workerProfile.categories.map((category: string, index: number) => (
                            <span
                              key={index}
                              className="px-3 py-1.5 bg-white rounded-full text-sm font-medium text-orange-700 border border-orange-200"
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Certificaciones */}
                    {workerProfile?.certifications && workerProfile.certifications.length > 0 && (
                      <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-200">
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-3 block flex items-center gap-2">
                          <Award size={14} />
                          Certificaciones
                        </label>
                        <div className="space-y-2">
                          {workerProfile.certifications.map((cert: string, index: number) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                              <CheckCircle className="text-indigo-600" size={16} />
                              <span>{cert}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Portfolio/Trabajos Anteriores */}
            {activeTab === 'portfolio' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <ImageIcon className="text-emerald-600" size={24} />
                    Portfolio de Trabajos Anteriores
                  </h3>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage || portfolioImages.length >= 5}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploadingImage ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Subiendo...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={18} />
                        <span>Agregar Imagen ({portfolioImages.length}/5)</span>
                      </>
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {loadingPortfolio ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando portfolio...</p>
                  </div>
                ) : portfolioImages.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <ImageIcon className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-600 mb-2">No hay imágenes en tu portfolio</p>
                    <p className="text-sm text-gray-500">Agrega imágenes de tus trabajos anteriores para mostrar tu experiencia (máximo 5)</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {portfolioImages.map((imageUrl, index) => (
                      <div key={index} className="relative group aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                        <Image
                          src={imageUrl}
                          alt={`Trabajo anterior ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        <button
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <XCircle size={20} />
                        </button>
                      </div>
                    ))}
                    {portfolioImages.length < 5 && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-emerald-500 hover:text-emerald-600 transition-colors disabled:opacity-50"
                      >
                        <Plus size={32} />
                        <span className="text-sm font-medium">Agregar más</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Reseñas */}
            {activeTab === 'reseñas' && (
              <div className="space-y-6">
                {/* Resumen de Reseñas */}
                <div className="p-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                  <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 text-lg">Resumen de Calificaciones</h4>
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center">{renderStars(reviewStats.averageRating)}</div>
                        <span className="text-3xl font-bold text-gray-900">
                          {reviewStats.averageRating > 0 ? reviewStats.averageRating.toFixed(1) : '0.0'}
                        </span>
                        <span className="text-gray-600">({reviewStats.totalReviews} reseñas)</span>
                      </div>
                    </div>
                    <div className="text-center md:text-right">
                      <div className="text-4xl font-bold text-emerald-600">{reviewStats.satisfaction}%</div>
                      <div className="text-sm text-gray-600">Satisfacción</div>
                    </div>
                  </div>
                </div>
                
                {/* Lista de Reseñas */}
                <div className="space-y-4">
                  {reviews.length > 0 ? (
                    reviews.map((review: any) => (
                      <div key={review.id} className="p-5 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                            {review.reviewer?.profile_picture_url ? (
                              <img 
                                src={review.reviewer.profile_picture_url} 
                                alt={review.reviewer.name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-white font-bold text-sm">
                                {review.reviewer?.name?.substring(0, 2).toUpperCase() || 'US'}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                              <h4 className="font-semibold text-gray-900">{review.reviewer?.name || 'Usuario'}</h4>
                              <span className="text-sm text-gray-500">{formatDate(review.created_at)}</span>
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
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Aún no tienes reseñas</h4>
                      <p className="text-gray-600">Completa tu primer trabajo para recibir calificaciones</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Verificación de Teléfono */}
      <PhoneVerificationModal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        onVerified={handlePhoneVerified}
        initialPhone={usuario?.phone?.replace(/\s/g, '') || ''}
        userId={usuario?.user_id}
      />
    </Layout>
  );
}
