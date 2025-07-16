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
  Award
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
        return 'bg-green-100 text-green-800 border-green-200';
      case 'en_proceso':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelado':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'servicio':
        return 'bg-[#743fc6] text-white';
      case 'pago':
        return 'bg-green-500 text-white';
      case 'reembolso':
        return 'bg-orange-500 text-white';
      case 'comision':
        return 'bg-purple-500 text-white';
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



  return (
    <Layout title="Historial" currentPage="historial">
      <div className="p-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Historial de Transacciones</h1>
            <p className="text-gray-600">Revisa todas tus transacciones y movimientos</p>
          </div>
        </div>



        {/* Búsqueda */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={20} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar transacciones, servicios o profesionales..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-[#743fc6]/20 focus:border-[#743fc6]"
            />
          </div>
        </div>

        {/* Lista de transacciones */}
        <div className="space-y-4">
          {sortedTransacciones.length > 0 ? (
            sortedTransacciones.map((transaccion) => (
              <div key={transaccion.id} className="bg-white rounded-2xl shadow-sm border p-6 hover:shadow-md transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    {/* Icono de tipo */}
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getTipoColor(transaccion.tipo)}`}>
                      {getTipoIcon(transaccion.tipo)}
                    </div>

                    {/* Información principal */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-800">{transaccion.titulo}</h3>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${transaccion.monto >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {transaccion.monto >= 0 ? '+' : '-'}{formatPrice(transaccion.monto)}
                          </p>
                          <p className="text-sm text-gray-500">{transaccion.fecha}</p>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-3">{transaccion.descripcion}</p>

                      {/* Información adicional para servicios */}
                      {transaccion.tipo === 'servicio' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          {transaccion.profesional && (
                            <div className="flex items-center space-x-2">
                              <User size={14} className="text-gray-400" />
                              <span className="text-gray-600">{transaccion.profesional}</span>
                            </div>
                          )}
                          {transaccion.servicio && (
                            <div className="flex items-center space-x-2">
                              <Award size={14} className="text-gray-400" />
                              <span className="text-gray-600">{transaccion.servicio}</span>
                            </div>
                          )}
                          {transaccion.ubicacion && (
                            <div className="flex items-center space-x-2">
                              <MapPin size={14} className="text-gray-400" />
                              <span className="text-gray-600">{transaccion.ubicacion}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer con estado y acciones */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-4">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getEstadoColor(transaccion.estado)}`}>
                      {getEstadoIcon(transaccion.estado)}
                      <span className="ml-1">
                        {transaccion.estado === 'completado' ? 'Completado' : 
                         transaccion.estado === 'en_proceso' ? 'En Proceso' : 
                         transaccion.estado === 'pendiente' ? 'Pendiente' : 'Cancelado'}
                      </span>
                    </div>

                    {/* Calificación para servicios completados */}
                    {transaccion.tipo === 'servicio' && transaccion.calificacion && (
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          {renderStars(transaccion.calificacion)}
                        </div>
                        <span className="text-sm text-gray-600">{transaccion.calificacion}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-[#743fc6] hover:bg-[#743fc6]/10 rounded-lg transition-colors">
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <History size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron transacciones</h3>
              <p className="text-gray-600">Intenta con otros filtros o términos de búsqueda</p>
            </div>
          )}
        </div>

        {/* Paginación */}
        {sortedTransacciones.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Mostrando {sortedTransacciones.length} de {transacciones.length} transacciones
            </p>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-2 text-sm text-gray-600 hover:text-[#743fc6] hover:bg-[#743fc6]/10 rounded-lg transition-colors">
                Anterior
              </button>
              <span className="px-3 py-2 text-sm text-gray-800">1</span>
              <button className="px-3 py-2 text-sm text-gray-600 hover:text-[#743fc6] hover:bg-[#743fc6]/10 rounded-lg transition-colors">
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
} 