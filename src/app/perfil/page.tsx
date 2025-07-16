'use client';
import { useState } from 'react';
import { 
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Save,
  X,
  Camera,
  Shield,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  Star,
  Clock,
  DollarSign,
  Award,
  CheckCircle,
  Star as StarIcon
} from 'lucide-react';
import Layout from '@/components/Layout';

interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  ubicacion: string;
  fechaRegistro: string;
  foto: string;
  calificacion: number;
  serviciosCompletados: number;
  serviciosActivos: number;
  balance: number;
  preferencias: {
    notificaciones: boolean;
    emailMarketing: boolean;
    privacidad: boolean;
  };
}

interface ServicioReciente {
  id: string;
  titulo: string;
  estado: 'activo' | 'en_proceso' | 'completado' | 'cancelado';
  fecha: string;
  profesional: string;
  precio: number;
}

export default function PerfilPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('informacion');

  // Datos de ejemplo del usuario
  const [usuario, setUsuario] = useState<Usuario>({
    id: '1',
    nombre: 'María',
    apellido: 'García',
    email: 'maria.garcia@email.com',
    telefono: '+57 300 123 4567',
    ubicacion: 'Bogotá, Colombia',
    fechaRegistro: '15 de Octubre, 2024',
    foto: '/api/placeholder/200/200',
    calificacion: 4.8,
    serviciosCompletados: 12,
    serviciosActivos: 2,
    balance: 250000,
    preferencias: {
      notificaciones: true,
      emailMarketing: false,
      privacidad: true
    }
  });

  const [formData, setFormData] = useState({
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    email: usuario.email,
    telefono: usuario.telefono,
    ubicacion: usuario.ubicacion
  });

  const serviciosRecientes: ServicioReciente[] = [
    {
      id: '1',
      titulo: 'Limpieza Residencial Completa',
      estado: 'completado',
      fecha: 'Hace 2 días',
      profesional: 'Ana Martínez',
      precio: 120000
    },
    {
      id: '2',
      titulo: 'Reparación de Grifo',
      estado: 'en_proceso',
      fecha: 'Hace 1 semana',
      profesional: 'Carlos López',
      precio: 85000
    },
    {
      id: '3',
      titulo: 'Organización de Closet',
      estado: 'activo',
      fecha: 'Hace 3 días',
      profesional: 'Laura Rodríguez',
      precio: 95000
    }
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        size={16}
        className={`${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : i < rating 
              ? 'text-yellow-400 fill-current' 
              : 'text-gray-300'
        }`}
      />
    ));
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'completado':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'en_proceso':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'activo':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelado':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleSave = () => {
    setUsuario(prev => ({
      ...prev,
      ...formData
    }));
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      telefono: usuario.telefono,
      ubicacion: usuario.ubicacion
    });
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Layout title="Mi Perfil" currentPage="perfil">
      <div className="p-6">
        {/* Header con información del usuario */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              {/* Foto de perfil */}
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-r from-[#743fc6] to-[#8a5fd1] rounded-full flex items-center justify-center text-2xl text-white font-bold">
                  {usuario.foto ? (
                    <img
                      src={usuario.foto}
                      alt={`${usuario.nombre} ${usuario.apellido}`}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    `${usuario.nombre[0]}${usuario.apellido[0]}`
                  )}
                </div>
                <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#fbbc6c] rounded-full flex items-center justify-center hover:bg-[#f9b055] transition-colors">
                  <Camera size={16} className="text-white" />
                </button>
              </div>

              {/* Información básica */}
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-1">
                  {usuario.nombre} {usuario.apellido}
                </h1>
                <p className="text-gray-600 mb-2">Miembro desde {usuario.fechaRegistro}</p>
                
                {/* Calificación */}
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    {renderStars(usuario.calificacion)}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{usuario.calificacion}</span>
                  <span className="text-sm text-gray-500">({usuario.serviciosCompletados} servicios)</span>
                </div>
              </div>
            </div>

            {/* Botón de editar */}
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="flex items-center space-x-2 px-4 py-2 bg-[#743fc6] text-white rounded-lg hover:bg-[#6a37b8] transition-colors"
                  >
                    <Save size={16} />
                    <span>Guardar</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <X size={16} />
                    <span>Cancelar</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Edit size={16} />
                  <span>Editar Perfil</span>
                </button>
              )}
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-[#743fc6]/10 to-[#8a5fd1]/10 rounded-xl p-4 border border-[#743fc6]/20">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#743fc6] rounded-lg flex items-center justify-center">
                  <Award size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Servicios Completados</p>
                  <p className="text-xl font-bold text-gray-800">{usuario.serviciosCompletados}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#fbbc6c]/10 to-[#f9b055]/10 rounded-xl p-4 border border-[#fbbc6c]/20">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#fbbc6c] rounded-lg flex items-center justify-center">
                  <Clock size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Servicios Activos</p>
                  <p className="text-xl font-bold text-gray-800">{usuario.serviciosActivos}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500/10 to-green-600/10 rounded-xl p-4 border border-green-500/20">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <DollarSign size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Balance</p>
                  <p className="text-xl font-bold text-gray-800">{formatPrice(usuario.balance)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs de navegación */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
          <div className="flex space-x-1 mb-6">
            {[
              { id: 'informacion', label: 'Información Personal', icon: User },
              { id: 'servicios', label: 'Mis Servicios', icon: Award },
              { id: 'preferencias', label: 'Preferencias', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-[#743fc6] text-white'
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
                {/* Información personal */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Información Personal</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.nombre}
                          onChange={(e) => handleInputChange('nombre', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#743fc6]/20 focus:border-[#743fc6] outline-none"
                        />
                      ) : (
                        <p className="text-gray-800">{usuario.nombre}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.apellido}
                          onChange={(e) => handleInputChange('apellido', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#743fc6]/20 focus:border-[#743fc6] outline-none"
                        />
                      ) : (
                        <p className="text-gray-800">{usuario.apellido}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#743fc6]/20 focus:border-[#743fc6] outline-none"
                        />
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Mail size={16} className="text-gray-400" />
                          <p className="text-gray-800">{usuario.email}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={formData.telefono}
                          onChange={(e) => handleInputChange('telefono', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#743fc6]/20 focus:border-[#743fc6] outline-none"
                        />
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Phone size={16} className="text-gray-400" />
                          <p className="text-gray-800">{usuario.telefono}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.ubicacion}
                          onChange={(e) => handleInputChange('ubicacion', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#743fc6]/20 focus:border-[#743fc6] outline-none"
                        />
                      ) : (
                        <div className="flex items-center space-x-2">
                          <MapPin size={16} className="text-gray-400" />
                          <p className="text-gray-800">{usuario.ubicacion}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Información adicional */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Información Adicional</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Calendar size={16} className="text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Fecha de Registro</p>
                          <p className="text-sm text-gray-600">{usuario.fechaRegistro}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Shield size={16} className="text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Verificación</p>
                          <p className="text-sm text-green-600">Cuenta verificada</p>
                        </div>
                      </div>
                      <CheckCircle size={16} className="text-green-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'servicios' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Servicios Recientes</h3>
              
              <div className="space-y-3">
                {serviciosRecientes.map((servicio) => (
                  <div key={servicio.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-800">{servicio.titulo}</h4>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getEstadoColor(servicio.estado)}`}>
                        {servicio.estado === 'completado' ? 'Completado' : 
                         servicio.estado === 'en_proceso' ? 'En Proceso' : 
                         servicio.estado === 'activo' ? 'Activo' : 'Cancelado'}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-4">
                        <span>Profesional: {servicio.profesional}</span>
                        <span>Fecha: {servicio.fecha}</span>
                      </div>
                      <span className="font-semibold text-[#743fc6]">{formatPrice(servicio.precio)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'preferencias' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Configuración de Preferencias</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Bell size={16} className="text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Notificaciones Push</p>
                      <p className="text-xs text-gray-600">Recibe notificaciones sobre tus servicios</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={usuario.preferencias.notificaciones} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#743fc6]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#743fc6]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Mail size={16} className="text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Email Marketing</p>
                      <p className="text-xs text-gray-600">Recibe ofertas y promociones por email</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={usuario.preferencias.emailMarketing} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#743fc6]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#743fc6]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Shield size={16} className="text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Privacidad</p>
                      <p className="text-xs text-gray-600">Mantén tu información privada</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={usuario.preferencias.privacidad} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#743fc6]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#743fc6]"></div>
                  </label>
                </div>
              </div>

              {/* Botón de cerrar sesión */}
              <div className="pt-6 border-t border-gray-200">
                <button className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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