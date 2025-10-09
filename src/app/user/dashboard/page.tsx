'use client';

import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import Layout from '@/components/Layout';
import { useDashboard } from '@/hooks/useDashboard';
import { WelcomeBanner } from '@/components/ui/WelcomeBanner';
import { ServiceCard } from '@/components/ui/ServiceCard';
import { TopProfessionals } from '@/components/ui/TopProfessionals';

export default function Dashboard() {
  const router = useRouter();
  const { services, categories, topWorkers, userName, loading, error, handleDeleteService } = useDashboard();

  const handleCrearServicio = () => {
    router.push('/user/crear-servicio');
  };

  const handleVerDetalles = (serviceId: string) => {
    if (!serviceId) {
      alert('Error: ID de servicio no válido');
      return;
    }
    router.push(`/user/detalles-postulantes?id=${serviceId}`);
  };

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
        <WelcomeBanner userName={userName} onCreateService={handleCrearServicio} />

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Mis Servicios</h3>
              </div>
              
              <div className="space-y-4">
                {services.length > 0 ? (
                  services.slice(0, 3).map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      categories={categories}
                      onViewDetails={handleVerDetalles}
                      onDelete={handleDeleteService}
                    />
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

          <div className="lg:col-span-1">
            <TopProfessionals professionals={topWorkers} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
