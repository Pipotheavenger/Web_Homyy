'use client';
import { useState } from 'react';
import { 
  History,
  Search,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Star,
  MapPin,
  User,
  Star as StarIcon,
  Award,
  Filter,
  Calendar,
  TrendingUp
} from 'lucide-react';
import Layout from '@/components/Layout';

interface Transaccion {
  id: string;
  tipo: 'servicio' | 'pago' | 'reembolso' | 'comision';
  titulo: string;
  descripcion: string;
  monto: number;
  fecha: string;
  estado: 'completado' | 'pendiente' | 'cancelado' | 'en_proceso';
  profesional?: string;
  servicio?: string;
  calificacion?: number;
  ubicacion?: string;
}

interface Filtro {
  tipo: string;
  estado: string;
  fechaDesde: string;
  fechaHasta: string;
  montoMin: string;
  montoMax: string;
}

export default function HistorialPage() {
  const [searchTerm, setSearchTerm] = useState('');

  // Datos de ejemplo de transacciones
  const [transacciones] = useState<Transaccion[]>([
    {
      id: '1',
      tipo: 'servicio',
      titulo: 'Limpieza Residencial Completa',
      descripcion: 'Limpieza profunda de casa de 3 habitaciones',
      monto: 120000,
      fecha: '15 Oct 2024',
      estado: 'completado',
      profesional: 'Ana Martínez',
      servicio: 'Limpieza Profesional',
      calificacion: 5,
      ubicacion: 'Chapinero, Bogotá'
    },
    {
      id: '2',
      tipo: 'pago',
      titulo: 'Recarga de Saldo',
      descripcion: 'Recarga realizada desde tarjeta de crédito',
      monto: 500000,
      fecha: '12 Oct 2024',
      estado: 'completado'
    },
    {
      id: '3',
      tipo: 'servicio',
      titulo: 'Reparación de Grifo',
      descripcion: 'Reparación de grifo de cocina con fugas',
      monto: 85000,
      fecha: '10 Oct 2024',
      estado: 'en_proceso',
      profesional: 'Carlos López',
      servicio: 'Plomería',
      ubicacion: 'Usaquén, Bogotá'
    },
    {
      id: '4',
      tipo: 'reembolso',
      titulo: 'Reembolso por Cancelación',
      descripcion: 'Reembolso por cancelación de servicio',
      monto: -95000,
      fecha: '8 Oct 2024',
      estado: 'completado'
    },
    {
      id: '5',
      tipo: 'servicio',
      titulo: 'Organización de Closet',
      descripcion: 'Organización y limpieza de closet principal',
      monto: 95000,
      fecha: '5 Oct 2024',
      estado: 'completado',
      profesional: 'Laura Rodríguez',
      servicio: 'Organización',
      calificacion: 4,
      ubicacion: 'Teusaquillo, Bogotá'
    },
    {
      id: '6',
      tipo: 'comision',
      titulo: 'Comisión de Servicio',
      descripcion: 'Comisión por servicio de limpieza',
      monto: -12000,
      fecha: '15 Oct 2024',
      estado: 'completado'
    },
    {
      id: '7',
      tipo: 'servicio',
      titulo: 'Instalación de Ventilador',
      descripcion: 'Instalación de ventilador de techo',
      monto: 150000,
      fecha: '3 Oct 2024',
      estado: 'cancelado',
      profesional: 'Roberto Hernández',
      servicio: 'Electricidad',
      ubicacion: 'La Soledad, Bogotá'
    },
    {
      id: '8',
      tipo: 'pago',
      titulo: 'Retiro de Saldo',
      descripcion: 'Retiro realizado a cuenta bancaria',
      monto: -200000,
      fecha: '1 Oct 2024',
      estado: 'completado'
    }
  ]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        size={14}
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
        return 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200';
      case 'en_proceso':
        return 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border-blue-200';
      case 'pendiente':
        return 'bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-700 border-yellow-200';
      case 'cancelado':
        return 'bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border-red-200';
      default:
        return 'bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 border-gray-200';
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'servicio':
        return 'bg-gradient-to-br from-purple-500 to-pink-500';
      case 'pago':
        return 'bg-gradient-to-br from-green-500 to-emerald-500';
      case 'reembolso':
        return 'bg-gradient-to-br from-orange-500 to-red-500';
      case 'comision':
        return 'bg-gradient-to-br from-indigo-500 to-purple-500';
      default:
        return 'bg-gradient-to-br from-gray-500 to-slate-500';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'servicio':
        return <User size={16} />;
      case 'pago':
        return <DollarSign size={16} />;
      case 'reembolso':
        return <XCircle size={16} />;
      case 'comision':
        return <DollarSign size={16} />;
      default:
        return <History size={16} />;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(Math.abs(price));
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'completado':
        return <CheckCircle size={16} />;
      case 'en_proceso':
        return <Clock size={16} />;
      case 'pendiente':
        return <AlertCircle size={16} />;
      case 'cancelado':
        return <XCircle size={16} />;
      default:
        return <History size={16} />;
    }
  };

  const filteredTransacciones = transacciones.filter(transaccion => {
    const matchesSearch = transaccion.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaccion.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (transaccion.profesional && transaccion.profesional.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  const sortedTransacciones = [...filteredTransacciones].sort((a, b) => {
    return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
  });

  // Calcular estadísticas
  const totalIngresos = transacciones
    .filter(t => t.monto > 0)
    .reduce((sum, t) => sum + t.monto, 0);
  
  const totalGastos = transacciones
    .filter(t => t.monto < 0)
    .reduce((sum, t) => sum + Math.abs(t.monto), 0);

  return (
    <Layout 
      title="Historial" 
      breadcrumbs={[
        { label: 'Inicio', href: '/dashboard' },
        { label: 'Historial', active: true }
      ]}
      showBackButton={true}
      currentPage="historial"
    >
      <div className="p-4 md:p-6 space-y-6">
        {/* Header con estadísticas */}
        <div className="bg-gradient-to-r from-purple-50/80 via-pink-50/80 to-blue-50/80 rounded-2xl p-6 border border-purple-200/30">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                Historial de Transacciones
              </h1>
              <p className="text-gray-600 text-sm md:text-base">
                Revisa todas tus transacciones y movimientos
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp size={20} className="text-white" />
              </div>
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/40">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-400 rounded-lg flex items-center justify-center">
                  <DollarSign size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Ingresos</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatPrice(totalIngresos)}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/40">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-pink-400 rounded-lg flex items-center justify-center">
                  <DollarSign size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Gastos</p>
                  <p className="text-lg font-bold text-red-600">
                    {formatPrice(totalGastos)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Búsqueda */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgba(116,63,198,0.12)] border border-white/40 p-4 md:p-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={20} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar transacciones, servicios o profesionales..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-12 pr-4 py-4 border border-gray-200/60 rounded-xl leading-5 bg-white/80 backdrop-blur-sm placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 transition-all duration-300"
            />
          </div>
        </div>

        {/* Lista de transacciones */}
        <div className="space-y-4">
          {sortedTransacciones.length > 0 ? (
            sortedTransacciones.map((transaccion) => (
              <div key={transaccion.id} className="bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgba(116,63,198,0.12)] border border-white/40 p-4 md:p-6 hover:shadow-[0_12px_40px_rgba(116,63,198,0.15)] transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    {/* Icono de tipo */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${getTipoColor(transaccion.tipo)}`}>
                      {getTipoIcon(transaccion.tipo)}
                    </div>

                    {/* Información principal */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-gray-800 text-base md:text-lg">
                          {transaccion.titulo}
                        </h3>
                        <div className="text-right">
                          <p className={`text-lg md:text-xl font-bold ${transaccion.monto >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {transaccion.monto >= 0 ? '+' : '-'}{formatPrice(transaccion.monto)}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center justify-end space-x-1 mt-1">
                            <Calendar size={14} />
                            <span>{transaccion.fecha}</span>
                          </p>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-4 text-sm md:text-base">
                        {transaccion.descripcion}
                      </p>

                      {/* Información adicional para servicios */}
                      {transaccion.tipo === 'servicio' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          {transaccion.profesional && (
                            <div className="flex items-center space-x-2 bg-gray-50/80 rounded-lg p-2">
                              <User size={14} className="text-gray-400" />
                              <span className="text-gray-600 font-medium">{transaccion.profesional}</span>
                            </div>
                          )}
                          {transaccion.servicio && (
                            <div className="flex items-center space-x-2 bg-gray-50/80 rounded-lg p-2">
                              <Award size={14} className="text-gray-400" />
                              <span className="text-gray-600 font-medium">{transaccion.servicio}</span>
                            </div>
                          )}
                          {transaccion.ubicacion && (
                            <div className="flex items-center space-x-2 bg-gray-50/80 rounded-lg p-2">
                              <MapPin size={14} className="text-gray-400" />
                              <span className="text-gray-600 font-medium">{transaccion.ubicacion}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer con estado y acciones */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100/60">
                  <div className="flex items-center space-x-4">
                    <div className={`inline-flex items-center px-3 py-2 rounded-xl text-xs font-medium border ${getEstadoColor(transaccion.estado)}`}>
                      {getEstadoIcon(transaccion.estado)}
                      <span className="ml-2 font-semibold">
                        {transaccion.estado === 'completado' ? 'Completado' : 
                         transaccion.estado === 'en_proceso' ? 'En Proceso' : 
                         transaccion.estado === 'pendiente' ? 'Pendiente' : 'Cancelado'}
                      </span>
                    </div>

                    {/* Calificación para servicios completados */}
                    {transaccion.tipo === 'servicio' && transaccion.calificacion && (
                      <div className="flex items-center space-x-2 bg-yellow-50/80 rounded-lg p-2">
                        <div className="flex items-center space-x-1">
                          {renderStars(transaccion.calificacion)}
                        </div>
                        <span className="text-sm text-gray-600 font-medium">{transaccion.calificacion}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50/80 rounded-lg transition-all duration-300">
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgba(116,63,198,0.12)] border border-white/40">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <History size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron transacciones</h3>
              <p className="text-gray-600">Intenta con otros filtros o términos de búsqueda</p>
            </div>
          )}
        </div>

        {/* Paginación */}
        {sortedTransacciones.length > 0 && (
          <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <p className="text-sm text-gray-600 text-center md:text-left">
              Mostrando {sortedTransacciones.length} de {transacciones.length} transacciones
            </p>
            <div className="flex items-center justify-center space-x-2">
              <button className="px-4 py-2 text-sm text-gray-600 hover:text-purple-600 hover:bg-purple-50/80 rounded-xl transition-all duration-300 font-medium">
                Anterior
              </button>
              <span className="px-4 py-2 text-sm text-purple-600 bg-purple-50/80 rounded-xl font-medium">1</span>
              <button className="px-4 py-2 text-sm text-gray-600 hover:text-purple-600 hover:bg-purple-50/80 rounded-xl transition-all duration-300 font-medium">
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
} 