'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Calendar,
  MapPin,
  User,
  Star,
  Trash2
} from 'lucide-react';
import Layout from '@/components/Layout';
import { serviceService, statsService, categoryService } from '@/lib/services';
import type { Service, Category, ServiceSchedule } from '@/types/database';

export default function Dashboard() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos del usuario
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Cargar servicios del usuario
        const servicesResponse = await serviceService.getUserServices();
        if (servicesResponse.success && servicesResponse.data) {
          setServices(servicesResponse.data);
        } else {
          // Datos de ejemplo para pruebas
          setServices([
            {
              id: '1',
              user_id: 'user1',
              title: 'Reparar Fontaneria de la ducha',
              description: 'Necesito reparar la fontanería de la ducha que está goteando',
              category_id: '1',
              location: 'Bogotá, Chapinero alto',
              status: 'contratando',
              created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
              updated_at: new Date().toISOString(),
              category: {
                id: '1',
                name: 'Plomería',
                icon: '🔧',
                color: '#10B981',
                created_at: new Date().toISOString()
              },
              schedules: [
                {
                  id: 'schedule-1',
                  service_id: '1',
                  date_available: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  start_time: '09:00',
                  end_time: '17:00',
                  created_at: new Date().toISOString()
                },
                {
                  id: 'schedule-2',
                  service_id: '1',
                  date_available: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  start_time: '14:00',
                  end_time: '18:00',
                  created_at: new Date().toISOString()
                }
              ]
            },
            {
              id: '2',
              user_id: 'user1',
              title: 'Limpieza general de casa',
              description: 'Limpieza completa de la casa incluyendo cocina, baños y habitaciones',
              category_id: '2',
              location: 'Bogotá, Usaquén',
              status: 'eligiendo',
              created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              updated_at: new Date().toISOString(),
              category: {
                id: '2',
                name: 'Limpieza',
                icon: '🧹',
                color: '#3B82F6',
                created_at: new Date().toISOString()
              },
              schedules: [
                {
                  id: 'schedule-3',
                  service_id: '2',
                  date_available: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  start_time: '08:00',
                  end_time: '16:00',
                  created_at: new Date().toISOString()
                }
              ]
            },
            {
              id: '3',
              user_id: 'user1',
              title: 'Diseño de logo corporativo',
              description: 'Necesito un logo moderno para mi empresa de tecnología',
              category_id: '3',
              location: 'Bogotá, Chapinero',
              status: 'completado',
              created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              updated_at: new Date().toISOString(),
              category: {
                id: '3',
                name: 'Diseño',
                icon: '🎨',
                color: '#8B5CF6',
                created_at: new Date().toISOString()
              },
              schedules: []
            }
          ]);
        }

        // Cargar categorías
        const categoriesResponse = await categoryService.getAll();
        if (categoriesResponse.success && categoriesResponse.data) {
          setCategories(categoriesResponse.data);
        } else {
          // Categorías de ejemplo
          setCategories([
            {
              id: '1',
              name: 'Plomería',
              icon: '🔧',
              color: '#10B981',
              created_at: new Date().toISOString()
            },
            {
              id: '2',
              name: 'Limpieza',
              icon: '🧹',
              color: '#3B82F6',
              created_at: new Date().toISOString()
            },
            {
              id: '3',
              name: 'Diseño',
              icon: '🎨',
              color: '#8B5CF6',
              created_at: new Date().toISOString()
            }
          ]);
        }

        // Cargar estadísticas
        const statsResponse = await statsService.getDashboardStats();
        if (statsResponse.success && statsResponse.data) {
          setStats(statsResponse.data);
        }

      } catch (err) {
        setError('Error al cargar los datos del dashboard');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleCrearServicio = () => {
    router.push('/crear-servicio');
  };

  const handleVerDetalles = (serviceId: string) => {
    router.push(`/detalles-postulantes?id=${serviceId}`);
  };

  const getCategoryIcon = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName);
    if (category?.icon) {
      // Si el icono es un emoji, lo retornamos directamente
      if (category.icon.startsWith('🔧') || category.icon.startsWith('🧹') || category.icon.startsWith('🎨')) {
        return category.icon;
      }
      // Si es un texto como "wrench", lo convertimos a emoji
      switch (category.icon.toLowerCase()) {
        case 'wrench':
        case 'plomeria':
        case 'plumbing':
          return '🔧';
        case 'cleaning':
        case 'limpieza':
          return '🧹';
        case 'design':
        case 'diseño':
          return '🎨';
        case 'development':
        case 'desarrollo':
          return '💻';
        case 'electricity':
        case 'electricidad':
          return '⚡';
        case 'carpentry':
        case 'carpinteria':
          return '🔨';
        default:
          return '📋';
      }
    }
    return '📋';
  };

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category?.color || '#743fc6';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    
    return date.toLocaleDateString('es-CO', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const formatScheduleDisplay = (schedules: ServiceSchedule[]) => {
    if (!schedules || schedules.length === 0) return 'Sin horarios';
    
    // Ordenar por fecha
    const sortedSchedules = [...schedules].sort((a, b) => 
      new Date(a.date_available).getTime() - new Date(b.date_available).getTime()
    );
    
    // Mostrar solo los próximos 2 horarios
    return sortedSchedules.slice(0, 2).map(schedule => {
      const date = new Date(schedule.date_available);
      const formattedDate = date.toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'short'
      });
      return `${formattedDate} ${schedule.start_time}-${schedule.end_time}`;
    }).join(', ');
  };

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case 'contratando': return 25;
      case 'eligiendo': return 50;
      case 'contratado': return 75;
      case 'completado': return 100;
      default: return 25;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'contratando': return 'Contratando';
      case 'eligiendo': return 'Eligiendo';
      case 'contratado': return 'Contratado';
      case 'completado': return 'Completado';
      default: return 'Contratando';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'contratando': return 'text-blue-600 border-blue-400';
      case 'eligiendo': return 'text-orange-600 border-orange-400';
      case 'contratado': return 'text-purple-600 border-purple-400';
      case 'completado': return 'text-green-600 border-green-400';
      default: return 'text-blue-600 border-blue-400';
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    // Buscar el servicio para verificar su estado
    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    // Solo permitir eliminar si está completado
    if (service.status !== 'completado') {
      alert('Solo se pueden eliminar servicios que estén completados');
      return;
    }

    if (confirm('¿Estás seguro de que quieres eliminar este servicio completado?')) {
      try {
        const response = await serviceService.delete(serviceId);
        if (response.success) {
          // Recargar servicios
          const servicesResponse = await serviceService.getUserServices();
          if (servicesResponse.success && servicesResponse.data) {
            setServices(servicesResponse.data);
          }
        }
      } catch (error) {
        console.error('Error deleting service:', error);
      }
    }
  };

  const topProfessionals = [
    {
      id: 1,
      name: "Juan Pérez",
      profession: "Plomero",
      rating: 4.8,
      avatar: "👨‍🔧"
    },
    {
      id: 2,
      name: "María García",
      profession: "Maestra",
      rating: 4.9,
      avatar: "👩‍🏫"
    },
    {
      id: 3,
      name: "Carlos López",
      profession: "Electricista",
      rating: 4.7,
      avatar: "👨‍🔌"
    }
  ];

  // Mostrar loading mientras cargan los datos
  if (loading) {
    return (
      <Layout title="Dashboard" currentPage="dashboard">
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-[#743fc6]/30 border-t-[#743fc6] rounded-full animate-spin"></div>
          </div>
        </div>
      </Layout>
    );
  }

  // Mostrar error si hay problemas
  if (error) {
    return (
      <Layout title="Dashboard" currentPage="dashboard">
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600">
            {error}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout 
      title="Dashboard"
      currentPage="dashboard"
    >
      {/* Content */}
      <div className="p-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[#743fc6] to-[#8a5fd1] rounded-2xl mb-6 text-white relative overflow-hidden h-48 md:h-56 lg:h-64">
          <div className="flex flex-col md:flex-row items-center justify-between p-6 md:p-8 lg:p-10 h-full relative z-10">
            <div className="flex-1 mb-6 md:mb-0">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">¡Hola, María!</h2>
              <p className="text-purple-100 mb-4 text-sm md:text-base lg:text-lg">Buscas servicios para tu hogar?</p>
              <button 
                onClick={handleCrearServicio}
                className="bg-[#fbbc6c] text-white px-4 md:px-6 py-2 md:py-3 rounded-xl font-medium hover:bg-[#f9b055] transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2 text-sm md:text-base"
              >
                <Plus size={18} className="md:w-5 md:h-5" />
                <span>Crear Nuevo Servicio</span>
              </button>
            </div>
          </div>
          {/* Image positioned to reach bottom edge */}
          <div className="absolute bottom-0 right-0 h-full flex items-end">
            <img 
              src="/Banner.png" 
              alt="Banner" 
              className="h-full w-auto object-contain" 
            />
          </div>
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-full h-full opacity-10">
            <div className="absolute top-4 right-4 w-32 h-32 bg-white/20 rounded-full"></div>
            <div className="absolute bottom-4 right-8 w-24 h-24 bg-white/20 rounded-full"></div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* My Services Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Mis Servicios</h3>
              </div>
              
              <div className="space-y-4">
                {services.length > 0 ? (
                  services.slice(0, 3).map((service) => (
                    <div key={service.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all duration-200 bg-gradient-to-r from-gray-50 to-white relative">
                      {/* Botón de eliminar - solo habilitado cuando está completado */}
                      <button
                        onClick={() => handleDeleteService(service.id)}
                        disabled={service.status !== 'completado'}
                        className={`absolute top-2 right-2 p-1 transition-colors ${
                          service.status === 'completado'
                            ? 'text-gray-400 hover:text-red-500 cursor-pointer'
                            : 'text-gray-200 cursor-not-allowed'
                        }`}
                        title={service.status === 'completado' ? 'Eliminar servicio' : 'Solo se puede eliminar cuando esté completado'}
                      >
                        <Trash2 size={16} />
                      </button>
                      
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center text-2xl">
                            {getCategoryIcon(service.category?.name || 'Otros')}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span 
                                className="px-2 py-1 rounded-full text-xs font-medium"
                                style={{ 
                                  backgroundColor: `${getCategoryColor(service.category?.name || 'Otros')}20`,
                                  color: getCategoryColor(service.category?.name || 'Otros')
                                }}
                              >
                                {service.category?.name || 'Sin categoría'}
                              </span>
                            </div>
                            <h4 className="font-semibold text-gray-800 mb-2">{service.title}</h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Calendar size={14} />
                                <span>{formatDate(service.created_at)}</span>
                              </div>
                              {service.location && (
                                <div className="flex items-center space-x-1">
                                  <MapPin size={14} />
                                  <span>{service.location}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right pr-6">
                          <div className="flex items-center space-x-1 mb-2">
                            <User size={14} className="text-[#743fc6]" />
                            <span className="text-sm font-medium text-gray-700">
                              0 postulantes
                            </span>
                          </div>
                          
                          {/* Mostrar próximos horarios */}
                          {service.schedules && service.schedules.length > 0 && (
                            <div className="text-xs text-gray-600 mb-2">
                              {formatScheduleDisplay(service.schedules)}
                            </div>
                          )}
                          <div className="w-16 h-16 relative">
                            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                              <path
                                className="text-gray-200"
                                stroke="currentColor"
                                strokeWidth="3"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                              <path
                                className="text-[#743fc6]"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeDasharray={`${getProgressPercentage(service.status)}, 100`}
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-700">
                                {getProgressPercentage(service.status)}%
                              </span>
                            </div>
                          </div>
                          <p className={`text-xs font-medium mt-1 border-b-2 pb-1 ${getStatusColor(service.status)}`}>
                            {getStatusText(service.status)}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleVerDetalles(service.id)}
                        className="mt-3 w-full bg-[#743fc6] text-white py-2 rounded-lg hover:bg-[#6a37b8] transition-colors text-sm font-medium"
                      >
                        Ver Detalles
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Plus size={24} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes servicios aún</h3>
                    <p className="text-gray-600 mb-4">Crea tu primer servicio para comenzar</p>
                    <button 
                      onClick={handleCrearServicio}
                      className="bg-[#743fc6] text-white px-4 py-2 rounded-lg hover:bg-[#6a37b8] transition-colors"
                    >
                      Crear Servicio
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Top Professionals Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Profesionales Destacados</h3>
                <button className="text-[#743fc6] hover:text-[#8a5fd1] text-sm font-medium">
                  Ver todos
                </button>
              </div>
              
              <div className="space-y-4">
                {topProfessionals.map((professional) => (
                  <div key={professional.id} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center text-2xl">
                      {professional.avatar}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{professional.name}</h4>
                      <p className="text-sm text-gray-600">{professional.profession}</p>
                      <div className="flex items-center space-x-1 mt-1">
                        <Star size={14} className="text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600">{professional.rating}</span>
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
