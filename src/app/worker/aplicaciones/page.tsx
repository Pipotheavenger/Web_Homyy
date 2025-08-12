'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, DollarSign } from 'lucide-react';
import Layout from '@/components/Layout';
import { useUserType } from '@/contexts/UserTypeContext';

export default function MisAplicaciones() {
  const router = useRouter();
  const { colors } = useUserType();
  // Datos de ejemplo para las aplicaciones del trabajador
  const aplicaciones = [
    {
      id: '1',
      titulo: 'Limpieza Residencial',
      cliente: 'María González',
      ubicacion: 'Chapinero, Bogotá',
      precio: '$180,000',
      categoria: 'Limpieza',
      descripcion: 'Limpieza general de apartamento de 3 habitaciones',
      estado: 'pendiente',
      fechaAplicacion: 'Hace 2 días'
    },
    {
      id: '2',
      titulo: 'Reparación de Grifo',
      cliente: 'Carlos López',
      ubicacion: 'Usaquén, Bogotá',
      precio: '$120,000',
      categoria: 'Plomería',
      descripcion: 'Cambio de grifo en cocina',
      estado: 'aceptada',
      fechaAplicacion: 'Hace 1 día'
    },
    {
      id: '3',
      titulo: 'Organización de Closet',
      cliente: 'Ana Martínez',
      ubicacion: 'Teusaquillo, Bogotá',
      precio: '$200,000',
      categoria: 'Organización',
      descripcion: 'Organización completa de closet principal',
      estado: 'rechazada',
      fechaAplicacion: 'Hace 3 días'
    },
    {
      id: '4',
      titulo: 'Pintura de Habitación',
      cliente: 'Luis Rodríguez',
      ubicacion: 'Suba, Bogotá',
      precio: '$350,000',
      categoria: 'Pintura',
      descripcion: 'Pintura de habitación principal',
      estado: 'pendiente',
      fechaAplicacion: 'Hace 5 horas'
    }
  ];

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'aceptada':
        return 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200';
      case 'pendiente':
        return 'bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-700 border-yellow-200';
      case 'rechazada':
        return 'bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border-red-200';
      default:
        return 'bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 border-gray-200';
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'aceptada':
        return 'Aceptada';
      case 'pendiente':
        return 'Pendiente';
      case 'rechazada':
        return 'Rechazada';
      default:
        return 'Desconocido';
    }
  };

  const filteredAplicaciones = aplicaciones;

  const handleVerDetalles = (id: string) => {
    router.push(`/worker/aplicaciones/${id}`);
  };

  return (
    <Layout title="Mis Aplicaciones" currentPage="aplicaciones">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Mis Aplicaciones</h1>
          <p className="text-gray-600">Gestiona todas las ofertas a las que has aplicado</p>
        </div>



        {/* Lista de Aplicaciones */}
        <div className="space-y-4">
          {filteredAplicaciones.length > 0 ? (
            filteredAplicaciones.map((aplicacion) => (
                             <div key={aplicacion.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-orange-200 transition-all duration-300">
                 <div className="flex items-start justify-between mb-4">
                   <div className="flex-1">
                     <h3 className="text-xl font-bold text-gray-800 mb-2">{aplicacion.titulo}</h3>
                     <p className="text-gray-600 mb-3 leading-relaxed">{aplicacion.descripcion}</p>
                   </div>
                   <span className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${getEstadoColor(aplicacion.estado)}`}>
                     {getEstadoLabel(aplicacion.estado)}
                   </span>
                 </div>

                 <div className="flex items-center space-x-6 mb-4">
                   <div className="flex items-center space-x-2 text-gray-600">
                     <MapPin size={18} className="text-orange-500" />
                     <span className="font-medium">{aplicacion.ubicacion}</span>
                   </div>
                   <div className="flex items-center space-x-2 text-gray-600">
                     <DollarSign size={18} className="text-orange-500" />
                     <span className="font-bold text-lg">{aplicacion.precio}</span>
                   </div>
                 </div>

                 <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                   <div className="flex items-center space-x-4 text-sm text-gray-500">
                     <span className="font-medium">Cliente: {aplicacion.cliente}</span>
                     <span className="text-gray-300">•</span>
                     <span>{aplicacion.fechaAplicacion}</span>
                   </div>
                   <button
                     onClick={() => handleVerDetalles(aplicacion.id)}
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
                 <MapPin size={24} className="text-gray-400" />
               </div>
               <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes aplicaciones aún</h3>
               <p className="text-gray-600">Cuando apliques a trabajos, aparecerán aquí</p>
             </div>
          )}
        </div>
      </div>
    </Layout>
  );
} 