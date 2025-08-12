'use client';
import { useRouter } from 'next/navigation';
import { Plus, TrendingUp, Clock, DollarSign, Star, MapPin, Calendar } from 'lucide-react';
import Layout from '@/components/Layout';
import { useUserType } from '@/contexts/UserTypeContext';
import Image from 'next/image';

export default function WorkerDashboard() {
  const router = useRouter();
  const { colors } = useUserType();

  const handleVerTrabajos = () => {
    router.push('/worker/trabajos');
  };

  const handleVerAplicaciones = () => {
    router.push('/worker/aplicaciones');
  };

  // Datos de ejemplo para el trabajador
  const estadisticas = [
    {
      titulo: 'Total Ganancias',
      valor: '$2,450,000',
      cambio: '+12%',
      icono: <DollarSign className="w-6 h-6 text-orange-600" />,
      color: 'from-green-500 to-emerald-500'
    },
    {
      titulo: 'Trabajos Completados',
      valor: '24',
      cambio: '+3',
      icono: <TrendingUp className="w-6 h-6 text-orange-600" />,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      titulo: 'Calificación Promedio',
      valor: '4.8',
      cambio: '+0.2',
      icono: <Star className="w-6 h-6 text-orange-600" />,
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  const trabajosDisponibles = [
    {
      id: '1',
      titulo: 'Limpieza Residencial',
      cliente: 'María González',
      ubicacion: 'Chapinero, Bogotá',
      precio: '$180,000',
      fecha: '15 Dic',
      categoria: 'Limpieza',
      descripcion: 'Limpieza general de apartamento de 3 habitaciones',
      urgencia: 'Alta'
    },
    {
      id: '2',
      titulo: 'Reparación de Grifo',
      cliente: 'Carlos López',
      ubicacion: 'Usaquén, Bogotá',
      precio: '$120,000',
      fecha: '16 Dic',
      categoria: 'Plomería',
      descripcion: 'Cambio de grifo en cocina',
      urgencia: 'Media'
    },
    {
      id: '3',
      titulo: 'Organización de Closet',
      cliente: 'Ana Martínez',
      ubicacion: 'Teusaquillo, Bogotá',
      precio: '$200,000',
      fecha: '17 Dic',
      categoria: 'Organización',
      descripcion: 'Organización completa de closet principal',
      urgencia: 'Baja'
    }
  ];

  return (
    <Layout title="Dashboard" currentPage="dashboard">
      <div className="p-6">
        {/* Banner de Bienvenida */}
        <div className={`bg-gradient-to-r from-orange-300 to-orange-400 rounded-2xl mb-6 text-white relative overflow-hidden h-48 md:h-56 lg:h-64`}>
          <div className="flex flex-col md:flex-row items-center justify-between p-6 md:p-8 lg:p-10 h-full relative z-10">
            <div className="flex-1 mb-6 md:mb-0">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">¡Hola, Profesional!</h2>
              <p className="text-orange-100 mb-4 text-sm md:text-base lg:text-lg">¿Listo para encontrar tu próximo trabajo?</p>
              <button 
                onClick={handleVerTrabajos}
                className="bg-white text-orange-500 px-4 md:px-6 py-2 md:py-3 rounded-xl font-medium hover:bg-orange-50 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2 text-sm md:text-base"
              >
                <Plus size={18} className="md:w-5 md:h-5" />
                <span>Ver Trabajos Disponibles</span>
              </button>
            </div>
          </div>
          <div className="absolute bottom-0 right-0 h-full flex items-end">
            <Image 
              src="/Banner.png" 
              alt="Trabajadores" 
              width={300}
              height={300}
              className="h-full w-auto object-contain"
            />
          </div>
          <div className="absolute top-0 right-0 w-full h-full opacity-10">
            <div className="absolute top-4 right-4 w-32 h-32 bg-white/20 rounded-full"></div>
            <div className="absolute bottom-4 right-8 w-24 h-24 bg-white/20 rounded-full"></div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Trabajos Disponibles */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Trabajos Disponibles</h3>
                <button
                  onClick={handleVerTrabajos}
                  className="text-orange-500 hover:text-orange-600 font-medium text-sm"
                >
                  Ver todos →
                </button>
              </div>
              <div className="space-y-4">
                {trabajosDisponibles.length > 0 ? (
                  trabajosDisponibles.slice(0, 3).map((trabajo) => (
                    <div key={trabajo.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                                                     <div className="flex items-center space-x-2 mb-2">
                             <h4 className="font-semibold text-gray-800">{trabajo.titulo}</h4>
                           </div>
                          <p className="text-sm text-gray-600 mb-2">{trabajo.descripcion}</p>
                                                     <div className="flex items-center space-x-4 text-xs text-gray-500">
                             <div className="flex items-center space-x-1">
                               <MapPin size={14} />
                               <span>{trabajo.ubicacion}</span>
                             </div>
                             <div className="flex items-center space-x-1">
                               <Calendar size={14} />
                               <span>{trabajo.fecha}</span>
                             </div>
                           </div>
                        </div>
                                                 <button
                           onClick={() => router.push(`/worker/trabajos/${trabajo.id}`)}
                           className="ml-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
                         >
                           Ver Oferta
                         </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Plus size={24} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay trabajos disponibles</h3>
                    <p className="text-gray-600 mb-4">Revisa más tarde para nuevas oportunidades</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            {/* Estadísticas del Mes */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Estadísticas del Mes</h3>
              <div className="space-y-4">
                {estadisticas.map((stat, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                    <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                      <div className="text-white">{stat.icono}</div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{stat.titulo}</h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span className="font-bold text-lg">{stat.valor}</span>
                                                 <span className="text-orange-600 font-medium">{stat.cambio}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 