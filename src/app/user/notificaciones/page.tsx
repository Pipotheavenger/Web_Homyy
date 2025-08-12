'use client';
import { useState } from 'react';
import { 
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  Clock,
  User,
  DollarSign,
  Star,
  MapPin,
  Calendar,
  Trash2,
  Check,
  X,
  Filter,
  Search
} from 'lucide-react';
import Layout from '@/components/Layout';

interface Notificacion {
  id: string;
  tipo: 'servicio' | 'pago' | 'sistema' | 'promocion' | 'recordatorio';
  titulo: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
  importante: boolean;
  accion?: string;
  profesional?: string;
  servicio?: string;
  monto?: number;
  ubicacion?: string;
}

export default function NotificacionesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todas');
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([
    {
      id: '1',
      tipo: 'servicio',
      titulo: 'Servicio Confirmado',
      mensaje: 'Ana Martínez ha confirmado tu solicitud de limpieza residencial para mañana a las 9:00 AM.',
      fecha: 'Hace 5 minutos',
      leida: false,
      importante: true,
      accion: 'Ver detalles',
      profesional: 'Ana Martínez',
      servicio: 'Limpieza Residencial',
      ubicacion: 'Chapinero, Bogotá'
    },
    {
      id: '2',
      tipo: 'pago',
      titulo: 'Pago Recibido',
      mensaje: 'Has recibido $120,000 por el servicio de limpieza completado exitosamente.',
      fecha: 'Hace 1 hora',
      leida: false,
      importante: false,
      accion: 'Ver recibo',
      monto: 120000
    },
    {
      id: '3',
      tipo: 'sistema',
      titulo: 'Actualización de Seguridad',
      mensaje: 'Hemos actualizado nuestras políticas de seguridad. Revisa los nuevos términos.',
      fecha: 'Hace 2 horas',
      leida: true,
      importante: true,
      accion: 'Leer más'
    },
    {
      id: '4',
      tipo: 'promocion',
      titulo: '¡20% de Descuento!',
      mensaje: 'Aprovecha nuestro descuento especial en servicios de plomería esta semana.',
      fecha: 'Hace 3 horas',
      leida: true,
      importante: false,
      accion: 'Aplicar descuento'
    },
    {
      id: '5',
      tipo: 'recordatorio',
      titulo: 'Recordatorio de Servicio',
      mensaje: 'Tu servicio de reparación de grifo está programado para mañana a las 2:00 PM.',
      fecha: 'Hace 4 horas',
      leida: false,
      importante: false,
      accion: 'Ver detalles',
      servicio: 'Reparación de Grifo',
      ubicacion: 'Usaquén, Bogotá'
    },
    {
      id: '6',
      tipo: 'servicio',
      titulo: 'Nuevo Profesional Disponible',
      mensaje: 'Carlos López, especialista en electricidad, está disponible en tu área.',
      fecha: 'Hace 6 horas',
      leida: true,
      importante: false,
      accion: 'Ver perfil',
      profesional: 'Carlos López',
      servicio: 'Electricidad'
    },
    {
      id: '7',
      tipo: 'pago',
      titulo: 'Retiro Procesado',
      mensaje: 'Tu retiro de $200,000 ha sido procesado y llegará a tu cuenta en 1-2 días hábiles.',
      fecha: 'Hace 1 día',
      leida: true,
      importante: false,
      accion: 'Ver estado',
      monto: 200000
    },
    {
      id: '8',
      tipo: 'sistema',
      titulo: 'Mantenimiento Programado',
      mensaje: 'Nuestro sistema estará en mantenimiento el domingo de 2:00 AM a 4:00 AM.',
      fecha: 'Hace 2 días',
      leida: true,
      importante: true,
      accion: 'Más información'
    }
  ]);

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'servicio':
        return 'bg-[#743fc6] text-white';
      case 'pago':
        return 'bg-green-500 text-white';
      case 'sistema':
        return 'bg-blue-500 text-white';
      case 'promocion':
        return 'bg-orange-500 text-white';
      case 'recordatorio':
        return 'bg-yellow-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'servicio':
        return <User size={16} />;
      case 'pago':
        return <DollarSign size={16} />;
      case 'sistema':
        return <Info size={16} />;
      case 'promocion':
        return <Star size={16} />;
      case 'recordatorio':
        return <Clock size={16} />;
      default:
        return <Bell size={16} />;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const marcarComoLeida = (id: string) => {
    setNotificaciones(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, leida: true } : notif
      )
    );
  };

  const eliminarNotificacion = (id: string) => {
    setNotificaciones(prev => prev.filter(notif => notif.id !== id));
  };

  const marcarTodasComoLeidas = () => {
    setNotificaciones(prev => 
      prev.map(notif => ({ ...notif, leida: true }))
    );
  };

  const filteredNotificaciones = notificaciones.filter(notificacion => {
    const matchesSearch = notificacion.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notificacion.mensaje.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (notificacion.profesional && notificacion.profesional.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = selectedFilter === 'todas' || notificacion.tipo === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  const notificacionesNoLeidas = notificaciones.filter(n => !n.leida).length;

  return (
    <Layout title="Notificaciones" currentPage="notificaciones">
      <div className="p-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Notificaciones</h1>
              <p className="text-gray-600">
                {notificacionesNoLeidas} notificación{notificacionesNoLeidas !== 1 ? 'es' : ''} sin leer
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={marcarTodasComoLeidas}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Check size={16} />
                <span>Marcar todas como leídas</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={20} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar notificaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-[#743fc6]/20 focus:border-[#743fc6]"
              />
            </div>

            <div>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#743fc6]/20 focus:border-[#743fc6] outline-none"
              >
                <option value="todas">Todas las notificaciones</option>
                <option value="servicio">Servicios</option>
                <option value="pago">Pagos</option>
                <option value="sistema">Sistema</option>
                <option value="promocion">Promociones</option>
                <option value="recordatorio">Recordatorios</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de notificaciones */}
        <div className="space-y-4">
          {filteredNotificaciones.length > 0 ? (
            filteredNotificaciones.map((notificacion) => (
              <div 
                key={notificacion.id} 
                className={`bg-white rounded-2xl shadow-sm border p-6 transition-all duration-200 ${
                  !notificacion.leida ? 'border-l-4 border-l-[#743fc6] bg-blue-50/30' : ''
                } ${notificacion.importante ? 'ring-2 ring-orange-200' : ''}`}
              >
                <div className="flex items-start space-x-4">
                  {/* Icono de tipo */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTipoColor(notificacion.tipo)}`}>
                    {getTipoIcon(notificacion.tipo)}
                  </div>

                  {/* Contenido principal */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-800">{notificacion.titulo}</h3>
                        {!notificacion.leida && (
                          <div className="w-2 h-2 bg-[#743fc6] rounded-full"></div>
                        )}
                        {notificacion.importante && (
                          <div className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                            Importante
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{notificacion.fecha}</p>
                    </div>

                    <p className="text-gray-600 mb-3">{notificacion.mensaje}</p>

                    {/* Información adicional */}
                    {(notificacion.profesional || notificacion.servicio || notificacion.monto || notificacion.ubicacion) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-3">
                        {notificacion.profesional && (
                          <div className="flex items-center space-x-2">
                            <User size={14} className="text-gray-400" />
                            <span className="text-gray-600">{notificacion.profesional}</span>
                          </div>
                        )}
                        {notificacion.servicio && (
                          <div className="flex items-center space-x-2">
                            <Star size={14} className="text-gray-400" />
                            <span className="text-gray-600">{notificacion.servicio}</span>
                          </div>
                        )}
                        {notificacion.monto && (
                          <div className="flex items-center space-x-2">
                            <DollarSign size={14} className="text-gray-400" />
                            <span className="text-gray-600 font-medium">{formatPrice(notificacion.monto)}</span>
                          </div>
                        )}
                        {notificacion.ubicacion && (
                          <div className="flex items-center space-x-2">
                            <MapPin size={14} className="text-gray-400" />
                            <span className="text-gray-600">{notificacion.ubicacion}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Acciones */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      {notificacion.accion && (
                        <button className="text-[#743fc6] hover:text-[#6a37b8] font-medium text-sm transition-colors">
                          {notificacion.accion}
                        </button>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        {!notificacion.leida && (
                          <button
                            onClick={() => marcarComoLeida(notificacion.id)}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Marcar como leída"
                          >
                            <Check size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => eliminarNotificacion(notificacion.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar notificación"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron notificaciones</h3>
              <p className="text-gray-600">Intenta con otros filtros o términos de búsqueda</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
} 