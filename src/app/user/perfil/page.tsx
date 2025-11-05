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
  Star
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { useProfile } from '@/hooks/useProfile';
import { ProfileHeader } from '@/components/ui/ProfileHeader';
import { ProfileTabs } from '@/components/ui/ProfileTabs';
import { supabase } from '@/lib/supabase';

export default function PerfilPage() {
  const router = useRouter();
  const {
    usuario,
    formData,
    isEditing,
    activeTab,
    serviciosRecientes,
    loading,
    setIsEditing,
    setActiveTab,
    handleSave,
    handleCancel,
    handleInputChange,
    formatPrice
  } = useProfile();

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
        title="Mi Perfil" 
        currentPage="perfil"
      >
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!usuario) {
    return (
      <Layout 
        title="Mi Perfil" 
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
      title="Mi Perfil" 
      breadcrumbs={[
        { label: 'Inicio', href: '/dashboard' },
        { label: 'Mi Perfil', active: true }
      ]}
      showBackButton={false}
      currentPage="perfil"
    >
      <div className="p-3 lg:p-6 space-y-4 lg:space-y-6 max-w-full overflow-x-hidden">
        {/* Header con información del usuario */}
        <ProfileHeader
          usuario={usuario}
          formatPrice={formatPrice}
          createdAt={usuario?.fechaRegistro}
        />

        {/* Tabs de navegación */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgba(116,63,198,0.12)] border border-white/40 p-3 lg:p-6 w-full max-w-full overflow-hidden">
          <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Contenido de los tabs */}
          {activeTab === 'informacion' && (
            <div className="space-y-4 lg:space-y-6 mt-4 lg:mt-6">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
                {/* Información personal */}
                <div className="space-y-3 lg:space-y-4 w-full max-w-full overflow-hidden">
                  <div className="flex items-center space-x-2 lg:space-x-3 mb-4 lg:mb-6">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <User size={16} className="lg:w-5 lg:h-5 text-white" />
                    </div>
                    <h3 className="text-lg lg:text-xl font-bold text-gray-800 break-words">Información Personal</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1.5 lg:mb-2">Nombre</label>
                      <div className="bg-gray-50/80 rounded-xl p-2.5 lg:p-3 w-full max-w-full overflow-hidden">
                        <p className="text-sm lg:text-base text-gray-800 font-medium break-words">{usuario.nombre}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1.5 lg:mb-2">Apellido</label>
                      <div className="bg-gray-50/80 rounded-xl p-2.5 lg:p-3 w-full max-w-full overflow-hidden">
                        <p className="text-sm lg:text-base text-gray-800 font-medium break-words">{usuario.apellido}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1.5 lg:mb-2">Email</label>
                      <div className="bg-gray-50/80 rounded-xl p-2.5 lg:p-3 flex items-center space-x-2 lg:space-x-3 w-full max-w-full overflow-hidden">
                        <Mail size={14} className="lg:w-4 lg:h-4 text-gray-400 flex-shrink-0" />
                        <p className="text-sm lg:text-base text-gray-800 font-medium break-all">{usuario.email}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1.5 lg:mb-2">Teléfono</label>
                      <div className="bg-gray-50/80 rounded-xl p-2.5 lg:p-3 flex items-center space-x-2 lg:space-x-3 w-full max-w-full overflow-hidden">
                        <Phone size={14} className="lg:w-4 lg:h-4 text-gray-400 flex-shrink-0" />
                        <p className="text-sm lg:text-base text-gray-800 font-medium break-words">{usuario.telefono}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1.5 lg:mb-2">Ubicación</label>
                      <div className="bg-gray-50/80 rounded-xl p-2.5 lg:p-3 flex items-center space-x-2 lg:space-x-3 w-full max-w-full overflow-hidden">
                        <MapPin size={14} className="lg:w-4 lg:h-4 text-gray-400 flex-shrink-0" />
                        <p className="text-sm lg:text-base text-gray-800 font-medium break-words">{usuario.ubicacion}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información adicional */}
                <div className="space-y-3 lg:space-y-4 w-full max-w-full overflow-hidden">
                  <div className="flex items-center space-x-2 lg:space-x-3 mb-4 lg:mb-6">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <Shield size={16} className="lg:w-5 lg:h-5 text-white" />
                    </div>
                    <h3 className="text-lg lg:text-xl font-bold text-gray-800 break-words">Información Adicional</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-gray-50/80 to-blue-50/80 rounded-xl p-3 lg:p-4 border border-gray-200/30 w-full max-w-full overflow-hidden">
                      <div className="flex items-center space-x-2 lg:space-x-3">
                        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Calendar size={14} className="lg:w-4 lg:h-4 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs lg:text-sm font-medium text-gray-700 break-words">Fecha de Registro</p>
                          <p className="text-xs lg:text-sm text-gray-600 font-medium break-words">{usuario.fechaRegistro}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-50/80 to-emerald-50/80 rounded-xl p-3 lg:p-4 border border-green-200/30 w-full max-w-full overflow-hidden">
                      <div className="flex items-center justify-between gap-2 lg:gap-0">
                        <div className="flex items-center space-x-2 lg:space-x-3 min-w-0 flex-1">
                          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-green-400 to-emerald-400 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Shield size={14} className="lg:w-4 lg:h-4 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs lg:text-sm font-medium text-gray-700 break-words">Verificación</p>
                            <p className="text-xs lg:text-sm text-green-600 font-medium break-words">Cuenta verificada</p>
                          </div>
                        </div>
                        <CheckCircle size={18} className="lg:w-5 lg:h-5 text-green-500 flex-shrink-0" />
                      </div>
                    </div>

                    {/* Botón de cerrar sesión */}
                    <button 
                      onClick={handleLogout}
                      className="w-full bg-gradient-to-r from-gray-50/80 to-red-50/80 rounded-xl p-3 lg:p-4 border border-red-200/30 hover:border-red-300/50 transition-all duration-300 group max-w-full overflow-hidden"
                    >
                      <div className="flex items-center space-x-2 lg:space-x-3">
                        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-red-400 to-red-500 rounded-lg flex items-center justify-center group-hover:from-red-500 group-hover:to-red-600 transition-all duration-300 flex-shrink-0">
                          <LogOut size={14} className="lg:w-4 lg:h-4 text-white" />
                        </div>
                        <div className="text-left min-w-0 flex-1">
                          <p className="text-xs lg:text-sm font-medium text-gray-700 group-hover:text-red-600 transition-colors break-words">Cerrar Sesión</p>
                          <p className="text-xs text-gray-600 break-words">Salir de tu cuenta</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'servicios' && (
            <div className="space-y-3 lg:space-y-4 mt-4 lg:mt-6">
              <div className="flex items-center space-x-2 lg:space-x-3 mb-4 lg:mb-6">
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <Settings size={16} className="lg:w-5 lg:h-5 text-white" />
                </div>
                <h3 className="text-lg lg:text-xl font-bold text-gray-800 break-words">Servicios Recientes</h3>
              </div>
              
              <div className="space-y-3 lg:space-y-4">
                {serviciosRecientes && serviciosRecientes.length > 0 ? (
                  serviciosRecientes.map((booking) => (
                    <div key={booking.id} className="bg-white/80 backdrop-blur-sm rounded-xl p-3 lg:p-4 border border-gray-200/30 hover:shadow-[0_8px_30px_rgba(116,63,198,0.12)] transition-all duration-300 w-full max-w-full overflow-hidden">
                      {/* Layout vertical para pantallas <830px, horizontal para pantallas más grandes */}
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 lg:gap-0 mb-2 lg:mb-3">
                        <h4 className="font-semibold text-gray-800 text-sm lg:text-base xl:text-lg break-words flex-1">
                          {booking.service?.title || 'Servicio'}
                        </h4>
                        <div className={`inline-flex items-center px-2 lg:px-3 py-1.5 lg:py-2 rounded-xl text-xs font-medium border flex-shrink-0 ${getEstadoColor(booking.status)}`}>
                          {booking.status === 'completed' ? 'Completado' : 
                           booking.status === 'in_progress' ? 'En Progreso' : 
                           booking.status === 'scheduled' ? 'Agendado' : 'Cancelado'}
                        </div>
                      </div>
                      
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between text-xs lg:text-sm text-gray-600 space-y-2 lg:space-y-0 gap-2">
                        <div className="flex flex-col lg:flex-row lg:items-center space-y-1 lg:space-y-0 lg:space-x-4">
                          <span className="font-medium break-words">Trabajador: {booking.worker?.name || 'N/A'}</span>
                          <span className="font-medium break-words">Fecha: {booking.start_date}</span>
                        </div>
                        <span className="font-bold text-purple-600 text-base lg:text-lg break-words">{formatPrice(Number(booking.total_price))}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 lg:py-8">
                    <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Settings size={20} className="lg:w-6 lg:h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-600 text-xs lg:text-sm break-words">No tienes servicios contratados aún</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'reseñas' && (
            <div className="space-y-3 lg:space-y-4 mt-4 lg:mt-6">
              <div className="flex items-center space-x-2 lg:space-x-3 mb-4 lg:mb-6">
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <Star size={16} className="lg:w-5 lg:h-5 text-white" />
                </div>
                <h3 className="text-lg lg:text-xl font-bold text-gray-800 break-words">Reseñas Realizadas</h3>
              </div>
              
              <div className="text-center py-6 lg:py-8">
                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star size={20} className="lg:w-6 lg:h-6 text-gray-400" />
                </div>
                <p className="text-gray-600 text-xs lg:text-sm break-words">Aún no has dejado reseñas</p>
                <p className="text-gray-500 text-xs mt-1 break-words">Completa un servicio para dejar una calificación</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
} 