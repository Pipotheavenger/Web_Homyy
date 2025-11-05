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
  Briefcase
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { useWorkerProfileCurrent } from '@/hooks/useWorkerProfileCurrent';
import { supabase } from '@/lib/supabase';

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
    loading,
    error,
    setIsEditing,
    setActiveTab,
    handleSave,
    handleCancel,
    handleInputChange,
    formatPrice,
    formatDate
  } = useWorkerProfileCurrent();

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

  if (loading) {
    return (
      <Layout 
        title="Mi Perfil Profesional" 
        currentPage="perfil"
      >
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !usuario) {
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

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'completado':
        return 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200';
      case 'en_proceso':
        return 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border-blue-200';
      case 'activo':
        return 'bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-700 border-yellow-200';
      case 'cancelado':
        return 'bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border-red-200';
      default:
        return 'bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 border-gray-200';
    }
  };

  const handleBack = () => {
    router.push('/worker/dashboard');
  };

  // Función para renderizar estrellas
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
      <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
        {/* Header del Perfil - Estilo Limpio */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4 md:p-6 w-full max-w-full overflow-hidden">
          {/* Layout vertical para pantallas <1160px, horizontal para pantallas más grandes */}
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0 self-center lg:self-auto">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                {usuario?.profile_picture_url ? (
                  <img
                    src={usuario.profile_picture_url}
                    alt={usuario.name}
                    className="w-full h-full rounded-2xl object-cover"
                  />
                ) : (
                  <span className="text-xl md:text-2xl font-bold text-white">
                    {usuario?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                  </span>
                )}
              </div>
            </div>

            {/* Información Principal */}
            <div className="flex-1 text-center lg:text-left min-w-0">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 break-words">{usuario?.name || 'Usuario'}</h1>
              <p className="text-base md:text-lg text-gray-600 mb-3 break-words">{workerProfile?.profession || 'Profesional'}</p>
              
              {/* Rating */}
              <div className="flex items-center justify-center lg:justify-start space-x-2 mb-3 flex-wrap gap-1">
                <div className="flex items-center space-x-1">
                  {renderStars(reviewStats.averageRating)}
                </div>
                <span className="text-xs md:text-sm text-gray-600 break-words">
                  {reviewStats.averageRating > 0 ? reviewStats.averageRating.toFixed(1) : '0.0'} ({reviewStats.totalReviews} servicios)
                </span>
              </div>

              {/* Badge de Miembro */}
              <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium break-words">
                <CheckCircle size={14} className="md:w-4 md:h-4 flex-shrink-0" />
                <span className="break-words">Miembro desde {usuario?.created_at ? new Date(usuario.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Fecha no disponible'}</span>
              </div>
            </div>

            {/* Botón de Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center justify-center space-x-2 px-3 md:px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors w-full lg:w-auto flex-shrink-0"
            >
              <LogOut size={16} className="flex-shrink-0" />
              <span className="break-words">Cerrar Sesión</span>
            </button>
          </div>
        </div>

        {/* Métricas del Perfil */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 w-full max-w-full overflow-hidden">
          {/* Servicios Completados */}
          <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 w-full max-w-full overflow-hidden">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle size={18} className="sm:w-5 sm:h-5 text-emerald-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 break-words">Servicios Completados</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 break-words">{serviciosRecientes?.length || 0}</p>
              </div>
            </div>
          </div>

          {/* Servicios Activos */}
          <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 w-full max-w-full overflow-hidden">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock size={18} className="sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 break-words">Servicios Activos</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 break-words">0</p>
              </div>
            </div>
          </div>

          {/* Balance */}
          <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 w-full max-w-full overflow-hidden">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <DollarSign size={18} className="sm:w-5 sm:h-5 text-green-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 break-words">Balance</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 break-words">
                  ${usuario?.balance ? usuario.balance.toLocaleString() : '0'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs de Navegación */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4 md:p-6 w-full max-w-full overflow-hidden">
          <div className="flex flex-col lg:flex-row space-y-1 lg:space-y-0 lg:space-x-1 mb-4 lg:mb-6 w-full max-w-full overflow-x-auto">
            {[
              { id: 'informacion', label: 'Información Personal', icon: User },
              { id: 'servicios', label: 'Mis Trabajos', icon: Briefcase },
              { id: 'reseñas', label: 'Mis Reseñas', icon: Star }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center lg:justify-start space-x-2 px-3 lg:px-4 py-2 rounded-lg transition-all duration-200 text-sm lg:text-base w-full lg:w-auto flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon size={16} className="flex-shrink-0" />
                <span className="break-words text-center lg:text-left">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Contenido de los tabs */}
          {activeTab === 'informacion' && (
            <div className="space-y-4 lg:space-y-6 mt-4 lg:mt-6">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
                {/* Información Personal */}
                <div className="space-y-3 lg:space-y-4 w-full max-w-full overflow-hidden">
                  <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-3 lg:mb-4 break-words">Información Personal</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 lg:space-x-3 p-2.5 lg:p-3 bg-gray-50 rounded-lg w-full max-w-full overflow-hidden">
                      <User size={14} className="lg:w-4 lg:h-4 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs lg:text-sm text-gray-600 break-words">Nombre</p>
                        <p className="font-medium text-sm lg:text-base text-gray-900 break-words">{usuario?.name || 'No disponible'}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 lg:space-x-3 p-2.5 lg:p-3 bg-gray-50 rounded-lg w-full max-w-full overflow-hidden">
                      <Mail size={14} className="lg:w-4 lg:h-4 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs lg:text-sm text-gray-600 break-words">Email</p>
                        <p className="font-medium text-sm lg:text-base text-gray-900 break-all">{usuario?.email || 'No disponible'}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 lg:space-x-3 p-2.5 lg:p-3 bg-gray-50 rounded-lg w-full max-w-full overflow-hidden">
                      <Phone size={14} className="lg:w-4 lg:h-4 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs lg:text-sm text-gray-600 break-words">Teléfono</p>
                        <p className="font-medium text-sm lg:text-base text-gray-900 break-words">{usuario?.phone || 'No disponible'}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 lg:space-x-3 p-2.5 lg:p-3 bg-gray-50 rounded-lg w-full max-w-full overflow-hidden">
                      <MapPin size={14} className="lg:w-4 lg:h-4 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs lg:text-sm text-gray-600 break-words">Ubicación</p>
                        <p className="font-medium text-sm lg:text-base text-gray-900 break-words">{usuario?.location || 'No disponible'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información Profesional */}
                <div className="space-y-3 lg:space-y-4 w-full max-w-full overflow-hidden">
                  <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-3 lg:mb-4 break-words">Información Profesional</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 lg:space-x-3 p-2.5 lg:p-3 bg-emerald-50 rounded-lg w-full max-w-full overflow-hidden">
                      <Briefcase size={14} className="lg:w-4 lg:h-4 text-emerald-600 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs lg:text-sm text-gray-600 break-words">Profesión</p>
                        <p className="font-medium text-sm lg:text-base text-gray-900 break-words">{workerProfile?.profession || 'No especificado'}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 lg:space-x-3 p-2.5 lg:p-3 bg-blue-50 rounded-lg w-full max-w-full overflow-hidden">
                      <Calendar size={14} className="lg:w-4 lg:h-4 text-blue-600 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs lg:text-sm text-gray-600 break-words">Miembro desde</p>
                        <p className="font-medium text-sm lg:text-base text-gray-900 break-words">
                          {usuario?.created_at ? new Date(usuario.created_at).toLocaleDateString('es-CO', { 
                            day: 'numeric',
                            month: 'long', 
                            year: 'numeric' 
                          }) : 'Fecha no disponible'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 lg:space-x-3 p-2.5 lg:p-3 bg-green-50 rounded-lg w-full max-w-full overflow-hidden">
                      <Shield size={14} className="lg:w-4 lg:h-4 text-green-600 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs lg:text-sm text-gray-600 break-words">Estado de la cuenta</p>
                        <div className="flex items-center space-x-2">
                          <CheckCircle size={14} className="lg:w-4 lg:h-4 text-green-600 flex-shrink-0" />
                          <p className="font-medium text-sm lg:text-base text-gray-900 break-words">Verificada</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 lg:space-x-3 p-2.5 lg:p-3 bg-yellow-50 rounded-lg w-full max-w-full overflow-hidden">
                      <Award size={14} className="lg:w-4 lg:h-4 text-yellow-600 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs lg:text-sm text-gray-600 break-words">Calificación promedio</p>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            {renderStars(reviewStats.averageRating)}
                          </div>
                          <p className="font-medium text-sm lg:text-base text-gray-900 break-words">
                            {reviewStats.averageRating > 0 ? reviewStats.averageRating.toFixed(1) : 'Sin calificaciones'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'servicios' && (
            <div className="space-y-3 lg:space-y-4 mt-4 lg:mt-6">
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-3 lg:mb-4 break-words">Mis Trabajos</h3>
              
              <div className="space-y-3 sm:space-y-4">
                {serviciosRecientes && serviciosRecientes.length > 0 ? (
                  serviciosRecientes.map((booking) => (
                    <div key={booking.id} className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-100 w-full max-w-full overflow-hidden">
                      {/* Layout vertical para <1160px, horizontal para pantallas más grandes */}
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 lg:gap-0 mb-2 lg:mb-3">
                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base break-words flex-1">
                          {booking.service?.title || 'Servicio'}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 w-fit ${
                          booking.status === 'completed' ? 'bg-green-100 text-green-700' : 
                          booking.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 
                          booking.status === 'scheduled' ? 'bg-yellow-100 text-yellow-700' : 
                          'bg-red-100 text-red-700'
                        }`}>
                          {booking.status === 'completed' ? 'Completado' : 
                           booking.status === 'in_progress' ? 'En Progreso' : 
                           booking.status === 'scheduled' ? 'Agendado' : 'Cancelado'}
                        </span>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 text-xs sm:text-sm text-gray-600">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4">
                          <p className="break-words"><span className="font-medium">Cliente:</span> {booking.client?.name || 'N/A'}</p>
                          <p className="break-words"><span className="font-medium">Fecha:</span> {booking.start_date}</p>
                        </div>
                        <p className="font-bold text-emerald-600 text-base sm:text-lg break-words">{formatPrice(Number(booking.total_price))}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <Briefcase size={20} className="sm:w-6 sm:h-6 text-gray-400" />
                    </div>
                    <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 break-words">No tienes trabajos aún</h4>
                    <p className="text-gray-600 text-xs sm:text-sm break-words">Completa tu perfil y comienza a recibir propuestas</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'reseñas' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Mis Reseñas</h3>

              {/* Resumen de calificaciones */}
              <div className="p-3 sm:p-4 bg-emerald-50 rounded-lg border border-emerald-100 w-full max-w-full overflow-hidden">
                {/* Layout vertical para evitar cortes, horizontal en pantallas grandes */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-0">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base break-words">Resumen de Calificaciones</h4>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            size={14} 
                            className={`sm:w-4 sm:h-4 flex-shrink-0 ${star <= reviewStats.averageRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-lg sm:text-xl font-bold text-gray-900 break-words">
                        {reviewStats.averageRating > 0 ? reviewStats.averageRating.toFixed(1) : '0.0'}
                      </span>
                      <span className="text-xs sm:text-sm text-gray-600 break-words">({reviewStats.totalReviews} reseñas)</span>
                    </div>
                  </div>
                  <div className="text-left lg:text-right flex-shrink-0">
                    <div className="text-xl sm:text-2xl font-bold text-emerald-600 break-words">{reviewStats.satisfaction}%</div>
                    <div className="text-xs sm:text-sm text-gray-600 break-words">Satisfacción</div>
                  </div>
                </div>
              </div>
              
              {/* Lista de reseñas */}
              <div className="space-y-3">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex items-start space-x-3 mb-3">
                        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
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
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-gray-900">{review.reviewer?.name || 'Usuario'}</h4>
                            <span className="text-sm text-gray-500">{formatDate(review.created_at)}</span>
                          </div>
                          <div className="flex items-center space-x-1 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star} 
                                size={14} 
                                className={star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {review.comment && (
                        <p className="text-gray-700 text-sm leading-relaxed pl-13">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Star size={24} className="text-gray-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Aún no tienes reseñas</h4>
                    <p className="text-gray-600 text-sm">Completa tu primer trabajo para recibir calificaciones</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
} 