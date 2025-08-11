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
  X
} from 'lucide-react';
import Layout from '@/components/Layout';
import { useProfile } from '@/hooks/useProfile';
import { ProfileHeader } from '@/components/ui/ProfileHeader';
import { ProfileTabs } from '@/components/ui/ProfileTabs';

export default function PerfilPage() {
  const {
    usuario,
    formData,
    isEditing,
    activeTab,
    serviciosRecientes,
    setIsEditing,
    setActiveTab,
    handleSave,
    handleCancel,
    handleInputChange,
    formatPrice
  } = useProfile();

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
      showBackButton={true}
      currentPage="perfil"
    >
      <div className="p-4 md:p-6 space-y-6">
        {/* Header con información del usuario */}
        <ProfileHeader
          usuario={usuario}
          isEditing={isEditing}
          onEdit={() => setIsEditing(true)}
          onSave={handleSave}
          onCancel={handleCancel}
          formatPrice={formatPrice}
        />

        {/* Tabs de navegación */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgba(116,63,198,0.12)] border border-white/40 p-4 md:p-6">
          <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Contenido de los tabs */}
          {activeTab === 'informacion' && (
            <div className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Información personal */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                      <User size={20} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Información Personal</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.nombre}
                          onChange={(e) => handleInputChange('nombre', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200/60 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 outline-none bg-white/80 backdrop-blur-sm transition-all duration-300"
                        />
                      ) : (
                        <div className="bg-gray-50/80 rounded-xl p-3">
                          <p className="text-gray-800 font-medium">{usuario.nombre}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Apellido</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.apellido}
                          onChange={(e) => handleInputChange('apellido', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200/60 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 outline-none bg-white/80 backdrop-blur-sm transition-all duration-300"
                        />
                      ) : (
                        <div className="bg-gray-50/80 rounded-xl p-3">
                          <p className="text-gray-800 font-medium">{usuario.apellido}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200/60 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 outline-none bg-white/80 backdrop-blur-sm transition-all duration-300"
                        />
                      ) : (
                        <div className="bg-gray-50/80 rounded-xl p-3 flex items-center space-x-3">
                          <Mail size={16} className="text-gray-400" />
                          <p className="text-gray-800 font-medium">{usuario.email}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={formData.telefono}
                          onChange={(e) => handleInputChange('telefono', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200/60 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 outline-none bg-white/80 backdrop-blur-sm transition-all duration-300"
                        />
                      ) : (
                        <div className="bg-gray-50/80 rounded-xl p-3 flex items-center space-x-3">
                          <Phone size={16} className="text-gray-400" />
                          <p className="text-gray-800 font-medium">{usuario.telefono}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.ubicacion}
                          onChange={(e) => handleInputChange('ubicacion', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200/60 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 outline-none bg-white/80 backdrop-blur-sm transition-all duration-300"
                        />
                      ) : (
                        <div className="bg-gray-50/80 rounded-xl p-3 flex items-center space-x-3">
                          <MapPin size={16} className="text-gray-400" />
                          <p className="text-gray-800 font-medium">{usuario.ubicacion}</p>
                        </div>
                      )}
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
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'servicios' && (
            <div className="space-y-4 mt-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Settings size={20} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Servicios Recientes</h3>
              </div>
              
              <div className="space-y-4">
                {serviciosRecientes.map((servicio) => (
                  <div key={servicio.id} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/30 hover:shadow-[0_8px_30px_rgba(116,63,198,0.12)] transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-800 text-base md:text-lg">{servicio.titulo}</h4>
                      <div className={`inline-flex items-center px-3 py-2 rounded-xl text-xs font-medium border ${getEstadoColor(servicio.estado)}`}>
                        {servicio.estado === 'completado' ? 'Completado' : 
                         servicio.estado === 'en_proceso' ? 'En Proceso' : 
                         servicio.estado === 'activo' ? 'Activo' : 'Cancelado'}
                      </div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between text-sm text-gray-600 space-y-2 md:space-y-0">
                      <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
                        <span className="font-medium">Profesional: {servicio.profesional}</span>
                        <span className="font-medium">Fecha: {servicio.fecha}</span>
                      </div>
                      <span className="font-bold text-purple-600 text-lg">{formatPrice(servicio.precio)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'preferencias' && (
            <div className="space-y-6 mt-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Settings size={20} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Configuración de Preferencias</h3>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-gray-50/80 to-blue-50/80 rounded-xl p-4 border border-gray-200/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center">
                        <Bell size={16} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Notificaciones Push</p>
                        <p className="text-xs text-gray-600">Recibe notificaciones sobre tus servicios</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={usuario.preferencias.notificaciones} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-500"></div>
                    </label>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-gray-50/80 to-green-50/80 rounded-xl p-4 border border-gray-200/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-400 rounded-lg flex items-center justify-center">
                        <Mail size={16} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Email Marketing</p>
                        <p className="text-xs text-gray-600">Recibe ofertas y promociones por email</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={usuario.preferencias.emailMarketing} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-500"></div>
                    </label>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-gray-50/80 to-purple-50/80 rounded-xl p-4 border border-gray-200/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                        <Shield size={16} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Privacidad</p>
                        <p className="text-xs text-gray-600">Mantén tu información privada</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={usuario.preferencias.privacidad} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-500"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Botón de cerrar sesión */}
              <div className="pt-6 border-t border-gray-200/60">
                <button className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50/80 rounded-xl transition-all duration-300 font-medium">
                  <LogOut size={16} />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
} 