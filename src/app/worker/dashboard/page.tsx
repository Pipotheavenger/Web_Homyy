'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, TrendingUp, DollarSign, Star, MapPin, Calendar, XCircle, Clock, Briefcase, Eye, CheckCircle, Trash2 } from 'lucide-react';
import Layout from '@/components/Layout';
import { useUserType } from '@/contexts/UserTypeContext';
import { useWorkerDashboard } from '@/hooks/useWorkerDashboard';
import { WorkCompletionModal } from '@/components/ui/WorkCompletionModal';
import { escrowService, applicationsService } from '@/lib/services';
import Image from 'next/image';

export default function WorkerDashboard() {
  const router = useRouter();
  const { colors } = useUserType();
  const { userName, applications, stats, loading, error, formatPrice, formatDate, withdrawApplication, loadDashboardData } = useWorkerDashboard();
  
  // Estado para el modal de finalización de trabajo
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);

  const handleVerTrabajos = () => {
    router.push('/worker/trabajos');
  };

  const handleVerDetalles = (serviceId: string) => {
    router.push(`/worker/trabajos/${serviceId}`);
  };

  const handleWithdrawApplication = async (applicationId: string) => {
    if (confirm('¿Estás seguro de que quieres retirar esta aplicación?')) {
      const response = await withdrawApplication(applicationId);
      if (response.success) {
        alert('Aplicación retirada exitosamente');
      } else {
        alert('Error al retirar la aplicación');
      }
    }
  };

  const handleCompleteWork = (service: any) => {
    setSelectedService(service);
    setShowCompletionModal(true);
  };

  const handleDeleteApplication = async (applicationId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta aplicación? Esta acción no se puede deshacer.')) {
      try {
        const response = await applicationsService.delete(applicationId);
        if (response.success) {
          alert('Aplicación eliminada exitosamente');
          // Recargar las aplicaciones usando el método del hook
          loadDashboardData();
        } else {
          alert('Error al eliminar la aplicación: ' + response.error);
        }
      } catch (error) {
        console.error('Error eliminando aplicación:', error);
        alert('Error al eliminar la aplicación');
      }
    }
  };

  const handleSubmitPin = async (pin: string): Promise<boolean> => {
    if (!selectedService || !selectedService.serviceId) {
      console.error('No se ha seleccionado un servicio válido');
      return false;
    }
    
    try {
      const response = await escrowService.completeWorkWithPin(selectedService.serviceId, pin);
      if (response.success) {
        // Recargar datos después de completar exitosamente
        loadDashboardData();
        return true;
      } else {
        // El mensaje de error ya está en response.error
        // El componente WorkCompletionModalContent mostrará un mensaje apropiado
        return false;
      }
    } catch (error: any) {
      console.error('Error completing work:', error);
      // No propagar el error como excepción, simplemente retornar false
      // El componente mostrará un mensaje genérico de error
      return false;
    }
  };

  const handleCloseCompletionModal = () => {
    setShowCompletionModal(false);
    setSelectedService(null);
    // Recargar datos al cerrar el modal (por si se completó el trabajo)
    loadDashboardData();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200';
      case 'pending':
        return 'bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-700 border-yellow-200';
      case 'rejected':
        return 'bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border-red-200';
      case 'withdrawn':
        return 'bg-gradient-to-r from-gray-50 to-slate-50 text-gray-600 border-gray-200';
      default:
        return 'bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'Aceptada';
      case 'pending':
        return 'Pendiente';
      case 'rejected':
        return 'Rechazada';
      case 'withdrawn':
        return 'Retirada';
      default:
        return 'Desconocido';
    }
  };

  // Estadísticas con datos reales
  const estadisticas = [
    {
      titulo: 'Balance Actual',
      valor: formatPrice(stats.balance),
      cambio: stats.completedServices > 0 ? `+${stats.completedServices}` : '0',
      icono: <DollarSign className="w-6 h-6 text-emerald-600" />,
      color: 'from-green-500 to-emerald-500'
    },
    {
      titulo: 'Trabajos Completados',
      valor: stats.completedServices.toString(),
      cambio: stats.activeServices > 0 ? `${stats.activeServices} activos` : '0',
      icono: <TrendingUp className="w-6 h-6 text-emerald-600" />,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      titulo: 'Calificación Promedio',
      valor: stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '0.0',
      cambio: stats.pendingApplications > 0 ? `${stats.pendingApplications} pendientes` : '—',
      icono: <Star className="w-6 h-6 text-emerald-600" />,
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  // Mostrar error si existe
  if (error && applications.length === 0) {
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
    <Layout title="Dashboard" currentPage="dashboard">
      <div className="p-3 sm:p-4 md:p-6 max-w-full overflow-x-hidden">
        {/* Banner de Bienvenida */}
        <div className={`bg-gradient-to-r from-emerald-300 to-emerald-400 rounded-2xl mb-4 md:mb-6 text-gray-800 relative overflow-hidden min-h-[380px] sm:min-h-[400px] md:min-h-[380px] lg:min-h-[420px] xl:h-64 w-full max-w-full`}>
          {/* Contenido principal - Layout vertical para <1280px (xl:), horizontal para pantallas más grandes */}
          <div className="flex flex-col xl:flex-row items-center justify-between p-4 md:p-6 lg:p-8 xl:p-10 h-full relative z-10 min-h-[380px] sm:min-h-[400px] md:min-h-[380px] lg:min-h-[420px] xl:min-h-0 xl:h-full">
            {/* Texto y botón - Centrado en <1280px, alineado a la izquierda en pantallas más grandes */}
            <div className="flex-1 mb-6 sm:mb-8 md:mb-12 lg:mb-16 xl:mb-0 text-center xl:text-left w-full xl:w-auto px-2 xl:px-0 z-20 relative">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 xl:mb-2 break-words">¡Hola, {userName}!</h2>
              <p className="text-gray-700 mb-4 sm:mb-6 md:mb-8 lg:mb-10 xl:mb-4 text-sm md:text-base lg:text-lg break-words">¿Listo para encontrar tu próximo trabajo?</p>
              <button 
                onClick={handleVerTrabajos}
                className="bg-white text-emerald-600 px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-medium hover:bg-emerald-50 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 text-sm md:text-base w-full sm:w-auto mx-auto xl:mx-0 relative"
              >
                <Plus size={18} className="md:w-5 md:h-5" />
                <span>Ver Trabajos Disponibles</span>
              </button>
            </div>
          </div>
          
          {/* Imagen - Posicionada debajo del contenido en <1280px, a la derecha en pantallas más grandes */}
          <div className="absolute bottom-0 left-1/2 xl:left-auto xl:right-0 -translate-x-1/2 xl:translate-x-0 h-auto xl:h-full flex items-end justify-center xl:justify-end w-full xl:w-auto z-0">
            <Image 
              src="/Banner.png" 
              alt="Trabajadores" 
              width={300}
              height={300}
              className="h-48 sm:h-56 md:h-52 lg:h-48 xl:h-full w-auto object-contain max-h-[260px] sm:max-h-[300px] md:max-h-[280px] lg:max-h-[240px] xl:max-h-none"
            />
          </div>
          
          {/* Decoraciones de fondo */}
          <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none z-0">
            <div className="absolute top-4 right-4 w-32 h-32 bg-white/20 rounded-full"></div>
            <div className="absolute bottom-4 right-8 w-24 h-24 bg-white/20 rounded-full"></div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-2 min-w-0">
            {/* Mis Aplicaciones */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-3 sm:p-4 md:p-6 w-full max-w-full overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 md:mb-6">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 break-words">Mis Aplicaciones</h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 break-words">Gestiona tus postulaciones a trabajos</p>
                </div>
                <button
                  onClick={handleVerTrabajos}
                  className="px-3 sm:px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg hover:opacity-90 transition-all text-xs sm:text-sm font-medium flex items-center justify-center space-x-2 w-full sm:w-auto flex-shrink-0"
                >
                  <Plus size={14} className="sm:w-4 sm:h-4" />
                  <span>Buscar Trabajos</span>
                </button>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {loading && applications.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
                  </div>
                ) : applications.length > 0 ? (
                  applications.map((app) => (
                    <div key={app.id} className="bg-white/80 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-gray-300 shadow-md hover:shadow-lg transition-all w-full max-w-full overflow-hidden">
                      {/* Layout vertical para <1160px, horizontal para pantallas más grandes */}
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 lg:gap-0 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2 mb-2">
                            <h4 className="font-semibold text-gray-800 text-sm sm:text-base break-words flex-1">{app.service?.title || 'Servicio'}</h4>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${getStatusColor(app.status)}`}>
                              {getStatusText(app.status)}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-1 break-words">{app.service?.description || 'Sin descripción'}</p>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:flex-wrap gap-2 sm:gap-4 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <MapPin size={12} className="flex-shrink-0" />
                              <span className="break-words">{app.service?.location || 'No especificado'}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar size={12} className="flex-shrink-0" />
                              <span className="break-words">Aplicado: {formatDate(app.created_at)}</span>
                            </div>
                            {app.proposed_price && (
                              <div className="flex items-center space-x-1">
                                <DollarSign size={12} className="flex-shrink-0" />
                                <span className="font-semibold text-emerald-600 break-words">{formatPrice(app.proposed_price)}</span>
                              </div>
                            )}
                            {app.estimated_duration && (
                              <div className="flex items-center space-x-1">
                                <Clock size={12} className="flex-shrink-0" />
                                <span className="break-words">{app.estimated_duration}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          {/* Si el estado es 'withdrawn' o el servicio está completado, solo mostrar botón de eliminar */}
                          {(app.status === 'withdrawn' || app.service?.status === 'completed') ? (
                            <button
                              onClick={() => handleDeleteApplication(app.id)}
                              className="px-2 sm:px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 transition-colors flex items-center justify-center space-x-1 rounded-lg w-full sm:w-auto"
                              title="Eliminar aplicación"
                            >
                              <Trash2 size={14} className="flex-shrink-0" />
                              <span className="text-xs font-medium">Eliminar</span>
                            </button>
                          ) : (
                            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                              {app.service?.id && (
                                <button
                                  onClick={() => handleVerDetalles(app.service.id)}
                                  className="px-2 sm:px-3 py-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors flex items-center justify-center space-x-1 rounded-lg w-full sm:w-auto flex-shrink-0"
                                  title="Ver detalles del servicio"
                                >
                                  <Eye size={14} className="flex-shrink-0" />
                                  <span className="text-xs font-medium">Ver Detalles</span>
                                </button>
                              )}
                              {app.status === 'pending' && (
                                <button
                                  onClick={() => handleWithdrawApplication(app.id)}
                                  className="px-2 sm:px-3 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors flex items-center justify-center space-x-1 rounded-lg w-full sm:w-auto flex-shrink-0"
                                  title="Retirar aplicación"
                                >
                                  <XCircle size={16} className="sm:w-[18px] sm:h-[18px] flex-shrink-0" />
                                  <span className="text-xs font-medium">Retirar</span>
                                </button>
                              )}
                              {app.status === 'accepted' && app.service?.status !== 'completed' && (
                                <button
                                  onClick={() => handleCompleteWork({
                                    serviceId: app.service?.id || app.service_id,
                                    serviceTitle: app.service?.title || 'Servicio',
                                    applicationId: app.id
                                  })}
                                  className="px-2 sm:px-3 py-1 bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600 transition-all flex items-center justify-center space-x-1 rounded-lg transform hover:scale-105 w-full sm:w-auto flex-shrink-0"
                                  title="Finalizar trabajo"
                                >
                                  <CheckCircle size={14} className="flex-shrink-0" />
                                  <span className="text-xs font-medium">Finalizar</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      {app.cover_letter && (
                        <div className="mt-2 p-2 bg-gray-50 rounded-lg w-full max-w-full overflow-hidden">
                          <p className="text-xs text-gray-600 line-clamp-2 break-words"><strong>Nota:</strong> {app.cover_letter}</p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Briefcase size={24} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No has aplicado a trabajos aún</h3>
                    <p className="text-gray-600 mb-4">Busca trabajos disponibles y comienza a postularte</p>
                    <button
                      onClick={handleVerTrabajos}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:opacity-90 transition-all font-medium"
                    >
                      Explorar Trabajos
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 min-w-0">
            {/* Estadísticas del Mes */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-3 sm:p-4 md:p-6 w-full max-w-full overflow-hidden">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 break-words">Estadísticas del Mes</h3>
              <div className="space-y-3 sm:space-y-4">
                {estadisticas.map((stat, index) => (
                  <div key={index} className="flex items-center space-x-2 sm:space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-200 shadow-sm w-full max-w-full overflow-hidden">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 ${stat.color} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                      <div className="text-white">{stat.icono}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-800 text-sm sm:text-base break-words">{stat.titulo}</h4>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 gap-1 sm:gap-0 text-xs sm:text-sm text-gray-600">
                        <span className="font-bold text-base sm:text-lg break-words">{stat.valor}</span>
                        <span className="text-emerald-600 font-medium break-words">{stat.cambio}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de finalización de trabajo */}
      <WorkCompletionModal
        isOpen={showCompletionModal}
        onClose={handleCloseCompletionModal}
        onSubmit={handleSubmitPin}
        serviceTitle={selectedService?.serviceTitle || ''}
      />
    </Layout>
  );
} 