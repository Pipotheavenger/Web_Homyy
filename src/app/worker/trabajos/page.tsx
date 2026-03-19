'use client';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Filter, 
  MapPin, 
  DollarSign, 
  Calendar,
  Briefcase,
  Clock,
  ArrowLeft
} from 'lucide-react';
import Layout from '@/components/Layout';
import { useUserType } from '@/contexts/UserTypeContext';
import { useTrabajos } from '@/hooks/useTrabajos';

export default function TrabajosDisponiblesPage() {
  const router = useRouter();
  const { colors } = useUserType();
  const { 
    trabajos, 
    loading, 
    error,
    searchTerm, 
    setSearchTerm, 
    selectedCategory, 
    setSelectedCategory, 
    categorias, 
    formatPrice,
    reload
  } = useTrabajos();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <Layout title="Trabajos Disponibles" currentPage="trabajos">
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Trabajos Disponibles" currentPage="trabajos">
        <div className="p-6">
          <div className={`${colors.card} rounded-2xl p-8 border ${colors.border} text-center`}>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Error al cargar trabajos</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={reload}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentPage="trabajos">
      <div className="p-4 md:p-6 space-y-6">
        {/* Botón de regreso */}
        <button
          onClick={() => router.push('/worker/dashboard')}
          className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Volver al Dashboard</span>
        </button>

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
                <Briefcase size={20} className="text-white" />
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
                className="w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm rounded-xl border border-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-gray-800 placeholder:text-gray-400"
              />
            </div>

            {/* Categoría */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-white/80 backdrop-blur-sm rounded-xl border border-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-gray-800"
            >
              {categorias.map(categoria => (
                <option key={categoria} value={categoria}>
                  {categoria === 'todas' ? 'Todas las categorías' : categoria}
                </option>
              ))}
            </select>

            {/* Info */}
            <div className="flex items-center justify-center px-4 py-3 bg-white/80 backdrop-blur-sm rounded-xl border border-white/40">
              <span className="text-sm font-medium text-gray-700">
                {trabajos.length} {trabajos.length === 1 ? 'trabajo disponible' : 'trabajos disponibles'}
              </span>
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="space-y-4">
          {trabajos.length > 0 ? (
            trabajos.map((trabajo) => (
              <div key={trabajo.id} className={`${colors.card} rounded-2xl p-6 border ${colors.border} hover:shadow-[0_8px_30px_rgba(251,146,60,0.15)] transition-all duration-300`}>
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
                    <div className="mb-3">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {trabajo.title}
                      </h3>
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {trabajo.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-4">
                      <div className="flex items-center space-x-2 bg-gray-50/80 rounded-lg p-2">
                        <MapPin size={14} className="text-emerald-400" />
                        <span className="text-gray-700 font-medium">{trabajo.location || 'No especificado'}</span>
                      </div>
                      <div className="flex items-center space-x-2 bg-gray-50/80 rounded-lg p-2">
                        <Calendar size={14} className="text-emerald-400" />
                        <span className="text-gray-700 font-medium">{formatDate(trabajo.created_at)}</span>
                      </div>
                      <div className="flex items-center space-x-2 bg-gray-50/80 rounded-lg p-2">
                        <Briefcase size={14} className="text-emerald-400" />
                        <span className="text-gray-700 font-medium">{trabajo.category?.name || 'General'}</span>
                      </div>
                      {trabajo.client?.name && (
                        <div className="flex items-center space-x-2 bg-gray-50/80 rounded-lg p-2">
                          <span className="text-gray-500 text-sm">👤 Por:</span>
                          <span className="text-gray-700 font-medium text-sm">{trabajo.client.name}</span>
                          <div className="flex items-center space-x-1 ml-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/user/perfil-profesional?id=${trabajo.user_id}`);
                              }}
                              className="text-[10px] px-2 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-md transition-colors font-medium"
                              title="Ver perfil del cliente"
                            >
                              Ver Perfil
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col items-end justify-center">
                    <button 
                      onClick={() => router.push(`/worker/trabajos/${trabajo.id}`)}
                      className="px-8 py-3 text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:opacity-90 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
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
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No hay trabajos disponibles</h3>
              <p className="text-gray-600">
                Aún no hay trabajos activos. Vuelve más tarde para encontrar nuevas oportunidades.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
