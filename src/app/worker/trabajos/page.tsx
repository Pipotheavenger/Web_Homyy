'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Filter, 
  MapPin, 
  DollarSign, 
  Calendar,
  Star,
  Briefcase,
  Clock
} from 'lucide-react';
import Layout from '@/components/Layout';
import { useUserType } from '@/contexts/UserTypeContext';

interface Trabajo {
  id: string;
  titulo: string;
  descripcion: string;
  precio: number;
  ubicacion: string;
  fecha: string;
  categoria: string;
  cliente: string;
  verificado: boolean;
  tiempoEstimado: string;
}

export default function TrabajosDisponiblesPage() {
  const router = useRouter();
  const { colors } = useUserType();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todas');

  const [trabajos] = useState<Trabajo[]>([
    {
      id: '1',
      titulo: 'Limpieza Residencial Completa',
      descripcion: 'Limpieza profunda de casa de 3 habitaciones, 2 baños y cocina. Incluye limpieza de ventanas y organización básica.',
      precio: 120000,
      ubicacion: 'Chapinero, Bogotá',
      fecha: '15 Oct 2024',
      categoria: 'Limpieza',
      cliente: 'Ana Martínez',
      verificado: true,
      tiempoEstimado: '4-5 horas'
    },
    {
      id: '2',
      titulo: 'Reparación de Grifo de Cocina',
      descripcion: 'Grifo de cocina con fugas constantes. Necesita reparación o reemplazo completo.',
      precio: 85000,
      ubicacion: 'Usaquén, Bogotá',
      fecha: '12 Oct 2024',
      categoria: 'Plomería',
      cliente: 'Carlos López',
      verificado: false,
      tiempoEstimado: '2-3 horas'
    },
    {
      id: '3',
      titulo: 'Organización de Closet Principal',
      descripcion: 'Closet principal desorganizado. Necesita organización y limpieza completa.',
      precio: 95000,
      ubicacion: 'Teusaquillo, Bogotá',
      fecha: '10 Oct 2024',
      categoria: 'Organización',
      cliente: 'Laura Rodríguez',
      verificado: true,
      tiempoEstimado: '3-4 horas'
    },
    {
      id: '4',
      titulo: 'Instalación de Ventilador de Techo',
      descripcion: 'Instalación de ventilador de techo en sala principal. Ya se tiene el ventilador.',
      precio: 150000,
      ubicacion: 'La Soledad, Bogotá',
      fecha: '8 Oct 2024',
      categoria: 'Electricidad',
      cliente: 'Roberto Hernández',
      verificado: true,
      tiempoEstimado: '2-3 horas'
    },
    {
      id: '5',
      titulo: 'Pintura de Habitación',
      descripcion: 'Pintar habitación de 4x3 metros. Color blanco. Incluye preparación de paredes.',
      precio: 180000,
      ubicacion: 'Suba, Bogotá',
      fecha: '6 Oct 2024',
      categoria: 'Pintura',
      cliente: 'María González',
      verificado: false,
      tiempoEstimado: '5-6 horas'
    },
    {
      id: '6',
      titulo: 'Reparación de Lavadora',
      descripcion: 'Lavadora no centrifuga. Necesita diagnóstico y reparación.',
      precio: 120000,
      ubicacion: 'Kennedy, Bogotá',
      fecha: '5 Oct 2024',
      categoria: 'Electrodomésticos',
      cliente: 'Pedro Silva',
      verificado: true,
      tiempoEstimado: '3-4 horas'
    }
  ]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getVerificationBadge = (verificado: boolean) => {
    if (verificado) {
      return (
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-xs text-green-600 font-medium">Verificado</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          <span className="text-xs text-gray-500 font-medium">No verificado</span>
        </div>
      );
    }
  };

  const categorias = ['todas', 'Limpieza', 'Plomería', 'Electricidad', 'Pintura', 'Organización', 'Electrodomésticos'];

  const filteredTrabajos = trabajos.filter(trabajo => {
    const matchesSearch = trabajo.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trabajo.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trabajo.ubicacion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'todas' || trabajo.categoria === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <Layout currentPage="trabajos">
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className={`${colors.background} rounded-2xl p-6 border ${colors.border}`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                Trabajos Disponibles
              </h1>
              <p className="text-gray-600 text-sm md:text-base">
                Encuentra y aplica a trabajos que se ajusten a tus habilidades
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-2">
              <div className={`w-10 h-10 ${colors.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                <Search size={20} className="text-white" />
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar trabajos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm rounded-xl border border-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>

            {/* Categoría */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-white/80 backdrop-blur-sm rounded-xl border border-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            >
              {categorias.map(categoria => (
                <option key={categoria} value={categoria}>
                  {categoria === 'todas' ? 'Todas las categorías' : categoria}
                </option>
              ))}
            </select>

            {/* Botón de filtros */}
            <button className={`px-4 py-3 ${colors.gradient} text-white rounded-xl font-medium hover:opacity-80 transition-all duration-300 flex items-center justify-center space-x-2`}>
              <Filter size={18} />
              <span>Filtros</span>
            </button>
          </div>
        </div>

        {/* Resultados */}
        <div className="space-y-4">
          {filteredTrabajos.length > 0 ? (
            filteredTrabajos.map((trabajo) => (
              <div key={trabajo.id} className={`${colors.card} rounded-2xl p-6 border ${colors.border} hover:shadow-[0_8px_30px_rgba(116,63,198,0.12)] transition-all duration-300`}>
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                  <div className="flex-1">
                    <div className="mb-3">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {trabajo.titulo}
                      </h3>
                      <p className="text-gray-600 mb-3">
                        {trabajo.descripcion}
                      </p>
                    </div>

                                         <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm mb-4">
                       <div className="flex items-center space-x-2 bg-gray-50/80 rounded-lg p-2">
                         <MapPin size={14} className="text-gray-400" />
                         <span className="text-gray-600 font-medium">{trabajo.ubicacion}</span>
                       </div>
                       <div className="flex items-center space-x-2 bg-gray-50/80 rounded-lg p-2">
                         <Calendar size={14} className="text-gray-400" />
                         <span className="text-gray-600 font-medium">{trabajo.fecha}</span>
                       </div>
                       <div className="flex items-center space-x-2 bg-gray-50/80 rounded-lg p-2">
                         <Briefcase size={14} className="text-gray-400" />
                         <span className="text-gray-600 font-medium">{trabajo.categoria}</span>
                       </div>
                     </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400">👤</span>
                        <span className="text-gray-600 font-medium">{trabajo.cliente}</span>
                      </div>
                      {getVerificationBadge(trabajo.verificado)}
                    </div>
                  </div>

                                     <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col items-end">
                     <button 
                       onClick={() => router.push(`/worker/trabajos/${trabajo.id}`)}
                       className="px-6 py-2 text-white bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-80 rounded-xl font-medium transition-all duration-300"
                     >
                       Ver Detalles
                     </button>
                   </div>
                </div>
              </div>
            ))
          ) : (
            <div className={`${colors.card} rounded-2xl p-8 border ${colors.border} text-center`}>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No se encontraron trabajos</h3>
              <p className="text-gray-600">
                Intenta ajustar los filtros de búsqueda para encontrar más oportunidades
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
} 