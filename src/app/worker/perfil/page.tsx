'use client';
import { 
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Bell,
  Settings,
  LogOut,
  CheckCircle,
  User,
  Edit3,
  Save,
  X,
  Star,
  ThumbsUp,
  MessageCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { useWorkerProfile } from '@/hooks/useWorkerProfile';
import { ProfileHeader } from '@/components/ui/ProfileHeader';
import { ProfileTabs } from '@/components/ui/ProfileTabs';
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
    setIsEditing,
    setActiveTab,
    handleSave,
    handleCancel,
    handleInputChange,
    formatPrice,
    formatDate
  } = useWorkerProfile();

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

  if (!usuario) {
    return (
      <Layout 
        title="Mi Perfil Profesional" 
        currentPage="perfil"
      >
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600">
            Error al cargar el perfil. Por favor, intenta de nuevo.
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

  return (
    <Layout 
      title="Mi Perfil Profesional" 
      breadcrumbs={[
        { label: 'Inicio', href: '/worker/dashboard' },
        { label: 'Mi Perfil', active: true }
      ]}
      showBackButton={true}
      currentPage="perfil"
    >
      <div className="p-4 md:p-6 space-y-6">
        {/* Header con información del usuario */}
        <ProfileHeader
          usuario={usuario}
          formatPrice={formatPrice}
          createdAt={workerProfile?.created_at}
        />

        {/* Tabs de navegación */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgba(249,115,22,0.12)] border border-white/40 p-4 md:p-6">
          <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} userType="worker" />

          {/* Contenido de los tabs */}
          {activeTab === 'informacion' && (
            <div className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Información personal */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                      <User size={20} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Información Personal</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                      <div className="bg-gray-50/80 rounded-xl p-3">
                        <p className="text-gray-800 font-medium">{usuario.nombre}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Apellido</label>
                      <div className="bg-gray-50/80 rounded-xl p-3">
                        <p className="text-gray-800 font-medium">{usuario.apellido}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <div className="bg-gray-50/80 rounded-xl p-3 flex items-center space-x-3">
                        <Mail size={16} className="text-gray-400" />
                        <p className="text-gray-800 font-medium">{usuario.email}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                      <div className="bg-gray-50/80 rounded-xl p-3 flex items-center space-x-3">
                        <Phone size={16} className="text-gray-400" />
                        <p className="text-gray-800 font-medium">{usuario.telefono}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación</label>
                      <div className="bg-gray-50/80 rounded-xl p-3 flex items-center space-x-3">
                        <MapPin size={16} className="text-gray-400" />
                        <p className="text-gray-800 font-medium">{usuario.ubicacion}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información adicional */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Shield size={20} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Información Adicional</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-gray-50/80 to-blue-50/80 rounded-xl p-4 border border-gray-200/30">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center">
                          <Calendar size={16} className="text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Fecha de Registro</p>
                          <p className="text-sm text-gray-600 font-medium">{usuario.fechaRegistro}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-50/80 to-emerald-50/80 rounded-xl p-4 border border-green-200/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-400 rounded-lg flex items-center justify-center">
                            <Shield size={16} className="text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Verificación</p>
                            <p className="text-sm text-green-600 font-medium">Cuenta verificada</p>
                          </div>
                        </div>
                        <CheckCircle size={20} className="text-green-500" />
                      </div>
                    </div>

                    {/* Botón de cerrar sesión */}
                    <button 
                      onClick={handleLogout}
                      className="w-full bg-gradient-to-r from-gray-50/80 to-red-50/80 rounded-xl p-4 border border-red-200/30 hover:border-red-300/50 transition-all duration-300 group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-500 rounded-lg flex items-center justify-center group-hover:from-red-500 group-hover:to-red-600 transition-all duration-300">
                          <LogOut size={16} className="text-white" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-700 group-hover:text-red-600 transition-colors">Cerrar Sesión</p>
                          <p className="text-xs text-gray-600">Salir de tu cuenta</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'servicios' && (
            <div className="space-y-4 mt-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Settings size={20} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Trabajos Recientes</h3>
              </div>
              
              <div className="space-y-4">
                {serviciosRecientes && serviciosRecientes.length > 0 ? (
                  serviciosRecientes.map((booking) => (
                    <div key={booking.id} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/30 hover:shadow-[0_8px_30px_rgba(249,115,22,0.12)] transition-all duration-300">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-800 text-base md:text-lg">
                          {booking.service?.title || 'Servicio'}
                        </h4>
                        <div className={`inline-flex items-center px-3 py-2 rounded-xl text-xs font-medium border ${getEstadoColor(booking.status)}`}>
                          {booking.status === 'completed' ? 'Completado' : 
                           booking.status === 'in_progress' ? 'En Progreso' : 
                           booking.status === 'scheduled' ? 'Agendado' : 'Cancelado'}
                        </div>
                      </div>
                      
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between text-sm text-gray-600 space-y-2 md:space-y-0">
                        <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
                          <span className="font-medium">Cliente: {booking.client?.name || 'N/A'}</span>
                          <span className="font-medium">Fecha: {booking.start_date}</span>
                        </div>
                        <span className="font-bold text-orange-600 text-lg">{formatPrice(Number(booking.total_price))}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Settings size={24} className="text-gray-400" />
                    </div>
                    <p className="text-gray-600 text-sm">No tienes trabajos recientes</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'reseñas' && (
            <div className="space-y-4 mt-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Star size={20} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Mis Reseñas</h3>
              </div>

              {/* Resumen de calificaciones - ARRIBA */}
              <div className="bg-gradient-to-r from-orange-50/80 to-red-50/80 rounded-xl p-6 border border-orange-200/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Resumen de Calificaciones</h4>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            size={18} 
                            className={star <= reviewStats.averageRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                      <span className="text-2xl font-bold text-gray-800">
                        {reviewStats.averageRating > 0 ? reviewStats.averageRating.toFixed(1) : '0.0'}
                      </span>
                      <span className="text-sm text-gray-600">({reviewStats.totalReviews} reseñas)</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-orange-600">{reviewStats.satisfaction}%</div>
                    <div className="text-sm text-gray-600">Satisfacción</div>
                  </div>
                </div>
              </div>
              
              {/* Lista de reseñas */}
              <div className="space-y-4">{reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.id} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/30 hover:shadow-[0_8px_30px_rgba(249,115,22,0.12)] transition-all duration-300">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
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
                          <div>
                            <h4 className="font-semibold text-gray-800">{review.reviewer?.name || 'Usuario'}</h4>
                            <div className="flex items-center space-x-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star} 
                                  size={14} 
                                  className={star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                                />
                              ))}
                              <span className="text-sm text-gray-600 ml-2">{formatDate(review.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {review.comment && (
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Star size={24} className="text-gray-400" />
                    </div>
                    <p className="text-gray-600 text-sm">Aún no tienes reseñas</p>
                    <p className="text-gray-500 text-xs mt-1">Completa tu primer trabajo para recibir calificaciones</p>
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