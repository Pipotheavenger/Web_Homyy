'use client';
import { useRouter } from 'next/navigation';
import { Plus, TrendingUp, DollarSign, Star, MapPin, Calendar, XCircle, Clock, Briefcase } from 'lucide-react';
import Layout from '@/components/Layout';
import { useUserType } from '@/contexts/UserTypeContext';
import { useWorkerDashboard } from '@/hooks/useWorkerDashboard';
import Image from 'next/image';

export default function WorkerDashboard() {
  const router = useRouter();
  const { colors } = useUserType();
  const { userName, applications, stats, loading, error, formatPrice, formatDate, withdrawApplication } = useWorkerDashboard();

  const handleVerTrabajos = () => {
    router.push('/worker/trabajos');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200';
      case 'pending':
        return 'bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-700 border-yellow-200';
      case 'rejected':
        return 'bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border-red-200';
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
      titulo: 'Total Ganancias',
      valor: formatPrice(stats.totalEarnings),
      cambio: stats.completedBookings > 0 ? `+${stats.completedBookings}` : '0',
      icono: <DollarSign className="w-6 h-6 text-orange-600" />,
      color: 'from-green-500 to-emerald-500'
    },
    {
      titulo: 'Trabajos Completados',
      valor: stats.completedBookings.toString(),
      cambio: '+0',
      icono: <TrendingUp className="w-6 h-6 text-orange-600" />,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      titulo: 'Calificación Promedio',
      valor: stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '0.0',
      cambio: '—',
      icono: <Star className="w-6 h-6 text-orange-600" />,
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  if (loading) {
    return (
      <Layout title="Dashboard" currentPage="dashboard">
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
          </div>
        </div>
      </Layout>
    );
  }

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
    <Layout title="Dashboard" currentPage="dashboard">
      <div className="p-6">
        {/* Banner de Bienvenida */}
        <div className={`bg-gradient-to-r from-orange-300 to-orange-400 rounded-2xl mb-6 text-white relative overflow-hidden h-48 md:h-56 lg:h-64`}>
          <div className="flex flex-col md:flex-row items-center justify-between p-6 md:p-8 lg:p-10 h-full relative z-10">
            <div className="flex-1 mb-6 md:mb-0">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">¡Hola, {userName}!</h2>
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
            {/* Mis Aplicaciones */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Mis Aplicaciones</h3>
                  <p className="text-sm text-gray-600 mt-1">Gestiona tus postulaciones a trabajos</p>
                </div>
                <button
                  onClick={handleVerTrabajos}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:opacity-90 transition-all text-sm font-medium flex items-center space-x-2"
                >
                  <Plus size={16} />
                  <span>Buscar Trabajos</span>
                </button>
              </div>
              <div className="space-y-4">
                {applications.length > 0 ? (
                  applications.map((app) => (
                    <div key={app.id} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/30 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold text-gray-800">{app.service?.title || 'Servicio'}</h4>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(app.status)}`}>
                              {getStatusText(app.status)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-1">{app.service?.description || 'Sin descripción'}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <MapPin size={12} />
                              <span>{app.service?.location || 'No especificado'}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar size={12} />
                              <span>Aplicado: {formatDate(app.created_at)}</span>
                            </div>
                            {app.proposed_price && (
                              <div className="flex items-center space-x-1">
                                <DollarSign size={12} />
                                <span className="font-semibold text-orange-600">{formatPrice(app.proposed_price)}</span>
                              </div>
                            )}
                            {app.estimated_duration && (
                              <div className="flex items-center space-x-1">
                                <Clock size={12} />
                                <span>{app.estimated_duration}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {app.status === 'pending' && (
                          <button
                            onClick={() => handleWithdrawApplication(app.id)}
                            className="ml-4 text-red-600 hover:text-red-700 transition-colors flex items-center space-x-1"
                            title="Retirar aplicación"
                          >
                            <XCircle size={18} />
                            <span className="text-xs font-medium">Retirar</span>
                          </button>
                        )}
                      </div>
                      {app.cover_letter && (
                        <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-600 line-clamp-2"><strong>Nota:</strong> {app.cover_letter}</p>
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
                      className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:opacity-90 transition-all font-medium"
                    >
                      Explorar Trabajos
                    </button>
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