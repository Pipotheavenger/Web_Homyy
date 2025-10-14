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
      <div className="p-4 md:p-6 space-y-6">
        {/* Header del Perfil - Estilo Limpio */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center shadow-lg">
              {usuario?.profile_picture_url ? (
                <img
                  src={usuario.profile_picture_url}
                  alt={usuario.name}
                  className="w-full h-full rounded-2xl object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-white">
                  {usuario?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                </span>
              )}
            </div>

            {/* Información Principal */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{usuario?.name || 'Usuario'}</h1>
              <p className="text-lg text-gray-600 mb-3">{workerProfile?.profession || 'Profesional'}</p>
              
              {/* Rating */}
              <div className="flex items-center space-x-2 mb-3">
                <div className="flex items-center space-x-1">
                  {renderStars(reviewStats.averageRating)}
                </div>
                <span className="text-sm text-gray-600">
                  {reviewStats.averageRating > 0 ? reviewStats.averageRating.toFixed(1) : '0.0'} ({reviewStats.totalReviews} servicios)
                </span>
              </div>

              {/* Badge de Miembro */}
              <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
                <CheckCircle size={16} />
                <span>Miembro desde {usuario?.created_at ? new Date(usuario.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Fecha no disponible'}</span>
              </div>
            </div>

            {/* Botón de Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
            >
              <LogOut size={16} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>

        {/* Métricas del Perfil */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Servicios Completados */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle size={20} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Servicios Completados</p>
                <p className="text-2xl font-bold text-gray-900">{serviciosRecientes?.length || 0}</p>
              </div>
            </div>
          </div>

          {/* Servicios Activos */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Servicios Activos</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>

          {/* Balance */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Balance</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${usuario?.balance ? usuario.balance.toLocaleString() : '0'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs de Navegación */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex space-x-1 mb-6">
            {[
              { id: 'informacion', label: 'Información Personal', icon: User },
              { id: 'servicios', label: 'Mis Trabajos', icon: Briefcase },
              { id: 'reseñas', label: 'Mis Reseñas', icon: Star }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon size={16} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Contenido de los tabs */}
          {activeTab === 'informacion' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Información Personal */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <User size={16} className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Nombre</p>
                        <p className="font-medium text-gray-900">{usuario?.name || 'No disponible'}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Mail size={16} className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium text-gray-900">{usuario?.email || 'No disponible'}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Phone size={16} className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Teléfono</p>
                        <p className="font-medium text-gray-900">{usuario?.phone || 'No disponible'}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <MapPin size={16} className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Ubicación</p>
                        <p className="font-medium text-gray-900">{usuario?.location || 'No disponible'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información Profesional */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Profesional</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-emerald-50 rounded-lg">
                      <Briefcase size={16} className="text-emerald-600" />
                      <div>
                        <p className="text-sm text-gray-600">Profesión</p>
                        <p className="font-medium text-gray-900">{workerProfile?.profession || 'No especificado'}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <Calendar size={16} className="text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Miembro desde</p>
                          <p className="font-medium text-gray-900">
                            {usuario?.created_at ? new Date(usuario.created_at).toLocaleDateString('es-CO', { 
                              day: 'numeric',
                              month: 'long', 
                              year: 'numeric' 
                            }) : 'Fecha no disponible'}
                          </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <Shield size={16} className="text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">Estado de la cuenta</p>
                        <div className="flex items-center space-x-2">
                          <CheckCircle size={16} className="text-green-600" />
                          <p className="font-medium text-gray-900">Verificada</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                      <Award size={16} className="text-yellow-600" />
                      <div>
                        <p className="text-sm text-gray-600">Calificación promedio</p>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            {renderStars(reviewStats.averageRating)}
                          </div>
                          <p className="font-medium text-gray-900">
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
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Mis Trabajos</h3>
              
              <div className="space-y-3">
                {serviciosRecientes && serviciosRecientes.length > 0 ? (
                  serviciosRecientes.map((booking) => (
                    <div key={booking.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {booking.service?.title || 'Servicio'}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                      
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="space-y-1">
                          <p><span className="font-medium">Cliente:</span> {booking.client?.name || 'N/A'}</p>
                          <p><span className="font-medium">Fecha:</span> {booking.start_date}</p>
                        </div>
                        <p className="font-bold text-emerald-600 text-lg">{formatPrice(Number(booking.total_price))}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Briefcase size={24} className="text-gray-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">No tienes trabajos aún</h4>
                    <p className="text-gray-600 text-sm">Completa tu perfil y comienza a recibir propuestas</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'reseñas' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Mis Reseñas</h3>

              {/* Resumen de calificaciones */}
              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Resumen de Calificaciones</h4>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            size={16} 
                            className={star <= reviewStats.averageRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                      <span className="text-xl font-bold text-gray-900">
                        {reviewStats.averageRating > 0 ? reviewStats.averageRating.toFixed(1) : '0.0'}
                      </span>
                      <span className="text-sm text-gray-600">({reviewStats.totalReviews} reseñas)</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-600">{reviewStats.satisfaction}%</div>
                    <div className="text-sm text-gray-600">Satisfacción</div>
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