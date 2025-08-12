'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, DollarSign, Star, MapPin } from 'lucide-react';
import Layout from '@/components/Layout';
import { useUserType } from '@/contexts/UserTypeContext';

export default function Historial() {
  const router = useRouter();
  const { colors } = useUserType();


  // Datos de ejemplo para el historial del trabajador
  const trabajos = [
    {
      id: '1',
      titulo: 'Limpieza Residencial',
      cliente: 'María González',
      ubicacion: 'Chapinero, Bogotá',
      precio: '$180,000',
      fecha: '15 Dic 2024',
      categoria: 'Limpieza',
      estado: 'completado',
      calificacion: 5,
      ganancia: '$180,000'
    },
    {
      id: '2',
      titulo: 'Reparación de Grifo',
      cliente: 'Carlos López',
      ubicacion: 'Usaquén, Bogotá',
      precio: '$120,000',
      fecha: '12 Dic 2024',
      categoria: 'Plomería',
      estado: 'completado',
      calificacion: 4,
      ganancia: '$120,000'
    },
    {
      id: '3',
      titulo: 'Organización de Closet',
      cliente: 'Ana Martínez',
      ubicacion: 'Teusaquillo, Bogotá',
      precio: '$200,000',
      fecha: '10 Dic 2024',
      categoria: 'Organización',
      estado: 'completado',
      calificacion: 5,
      ganancia: '$200,000'
    },
    {
      id: '4',
      titulo: 'Pintura de Habitación',
      cliente: 'Luis Rodríguez',
      ubicacion: 'Suba, Bogotá',
      precio: '$350,000',
      fecha: '8 Dic 2024',
      categoria: 'Pintura',
      estado: 'completado',
      calificacion: 4,
      ganancia: '$350,000'
    },
    {
      id: '5',
      titulo: 'Instalación de Lámpara',
      cliente: 'Patricia Silva',
      ubicacion: 'Kennedy, Bogotá',
      precio: '$80,000',
      fecha: '5 Dic 2024',
      categoria: 'Electricidad',
      estado: 'completado',
      calificacion: 5,
      ganancia: '$80,000'
    }
  ];

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'completado':
        return 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200';
      case 'en_proceso':
        return 'bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 border-orange-200';
      case 'cancelado':
        return 'bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border-red-200';
      default:
        return 'bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 border-gray-200';
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'completado':
        return 'Completado';
      case 'en_proceso':
        return 'En Proceso';
      case 'cancelado':
        return 'Cancelado';
      default:
        return 'Desconocido';
    }
  };

  const filteredTrabajos = trabajos;

  const totalGanancias = trabajos.reduce((sum, trabajo) => sum + parseInt(trabajo.ganancia.replace('$', '').replace(',', '')), 0);
  const totalTrabajos = trabajos.length;
  const promedioCalificacion = trabajos.reduce((sum, trabajo) => sum + trabajo.calificacion, 0) / trabajos.length;

  return (
    <Layout title="Historial" currentPage="historial">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Historial de Trabajos</h1>
          <p className="text-gray-600">Revisa todos tus trabajos y ganancias</p>
        </div>

        {/* Estadísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Ganancias</p>
                <p className="text-2xl font-bold">${totalGanancias.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-100" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Trabajos Completados</p>
                <p className="text-2xl font-bold">{totalTrabajos}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-100" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Calificación Promedio</p>
                <p className="text-2xl font-bold">{promedioCalificacion.toFixed(1)}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-100" />
            </div>
          </div>
        </div>



        {/* Lista de Trabajos */}
        <div className="space-y-4">
          {filteredTrabajos.length > 0 ? (
            filteredTrabajos.map((trabajo) => (
                             <div key={trabajo.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-orange-200 transition-all duration-300">
                 <div className="flex items-start justify-between mb-4">
                   <div className="flex-1">
                     <h3 className="text-xl font-bold text-gray-800 mb-2">{trabajo.titulo}</h3>
                     <p className="text-gray-600 mb-3">Cliente: {trabajo.cliente}</p>
                   </div>
                   <div className="flex items-center space-x-3">
                     <span className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${getEstadoColor(trabajo.estado)}`}>
                       {getEstadoLabel(trabajo.estado)}
                     </span>
                     <div className="flex items-center space-x-1">
                       <Star size={18} className="text-yellow-500 fill-current" />
                       <span className="text-sm font-bold">{trabajo.calificacion}</span>
                     </div>
                   </div>
                 </div>

                 <div className="flex items-center space-x-6 mb-4">
                   <div className="flex items-center space-x-2 text-gray-600">
                     <MapPin size={18} className="text-orange-500" />
                     <span className="font-medium">{trabajo.ubicacion}</span>
                   </div>
                   <div className="flex items-center space-x-2 text-gray-600">
                     <DollarSign size={18} className="text-orange-500" />
                     <span className="font-bold text-lg">{trabajo.ganancia}</span>
                   </div>
                 </div>

                 <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                   <div className="flex items-center space-x-4 text-sm text-gray-500">
                     <span className="font-medium">Categoría: {trabajo.categoria}</span>
                     <span className="text-gray-300">•</span>
                     <span>{trabajo.fecha}</span>
                   </div>
                   <button
                     onClick={() => router.push(`/worker/historial/${trabajo.id}`)}
                     className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                   >
                     Ver Detalles
                   </button>
                 </div>
               </div>
            ))
          ) : (
                         <div className="text-center py-12">
               <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Star size={24} className="text-gray-400" />
               </div>
               <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes trabajos completados aún</h3>
               <p className="text-gray-600">Cuando completes trabajos, aparecerán aquí</p>
             </div>
          )}
        </div>
      </div>
    </Layout>
  );
} 