'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Plus } from 'lucide-react';
import Layout from '@/components/Layout';
import { useDashboard } from '@/hooks/useDashboard';
import { WelcomeBanner } from '@/components/ui/WelcomeBanner';
import ServiceCard from '@/components/ui/ServiceCard';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { reviewsService } from '@/lib/services';
import { useQueryClient } from '@tanstack/react-query';
import { dashboardKeys } from '@/hooks/queries/dashboardQueries';

const ReviewModal = dynamic(
  () => import('@/components/ui/ReviewModal').then(mod => ({ default: mod.ReviewModal })),
  { ssr: false }
);
const TopProfessionals = dynamic(
  () => import('@/components/ui/TopProfessionals').then(mod => ({ default: mod.TopProfessionals })),
  { ssr: false }
);

export default function Dashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { services, categories, topWorkers, userName, reviewedServices, loading, error, initialLoadComplete, handleDeleteService } = useDashboard();
  
  // Debug logs (removidos para producción)
  
  // Estado para el modal de reseñas
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedServiceForReview, setSelectedServiceForReview] = useState<any>(null);

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

  const handleLeaveReview = async (service: any) => {
    try {
      const { applicationsService } = await import('@/lib/services');
      const { supabase } = await import('@/lib/supabase');
      const applicationsResponse = await applicationsService.getByService(service.id);

      if (applicationsResponse.success && applicationsResponse.data) {
        const acceptedApplication = applicationsResponse.data.find(
          (app: any) => app.status === 'accepted'
        );

        if (acceptedApplication?.worker_id) {
          // Cargar professional_id aquí para no hacer query extra en handleSubmitReview
          const { data: workerProfile } = await supabase
            .from('worker_profiles')
            .select('id')
            .eq('user_id', acceptedApplication.worker_id)
            .maybeSingle();

          setSelectedServiceForReview({
            ...service,
            workerName: acceptedApplication.worker?.name,
            workerId: acceptedApplication.worker_id,
            workerProfileId: workerProfile?.id ?? null,
          });
        } else {
          setSelectedServiceForReview(service);
        }
      } else {
        setSelectedServiceForReview(service);
      }
      setShowReviewModal(true);
    } catch (error) {
      console.error('Error loading worker info:', error);
      setSelectedServiceForReview(service);
      setShowReviewModal(true);
    }
  };

  const handleSubmitReview = async (rating: number, comment: string): Promise<boolean> => {
    if (!selectedServiceForReview) return false;
    
    try {
      // Usar el workerId que ya se cargó en handleLeaveReview
      const workerUserId = selectedServiceForReview.workerId;
      
      if (!workerUserId) {
        alert('No se pudo identificar al trabajador asignado');
        return false;
      }

      // Verificar autenticación
      const { supabase } = await import('@/lib/supabase');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Usuario no autenticado');
        return false;
      }

      // Usar el workerProfileId precargado en handleLeaveReview
      const professionalId = selectedServiceForReview.workerProfileId;

      if (!professionalId) {
        alert('El trabajador no tiene un perfil profesional registrado');
        return false;
      }

      // Verificar si ya existe una reseña para este servicio y trabajador
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('service_id', selectedServiceForReview.id)
        .eq('professional_id', professionalId)
        .eq('reviewer_id', user.id)
        .maybeSingle();

      if (existingReview) {
        alert('Ya has enviado una reseña para este servicio');
        return false;
      }

      // Crear la reseña usando el professional_id (id de la tabla professionals)
      const response = await reviewsService.create({
        service_id: selectedServiceForReview.id,
        professional_id: professionalId, // Usar el id de la tabla professionals
        rating,
        comment: comment.trim() || undefined
      });

      if (response.success) {
        // Invalidar las queries para recargar los datos
        if (user?.id) {
          queryClient.invalidateQueries({ queryKey: dashboardKeys.services(user.id) });
          queryClient.invalidateQueries({ queryKey: dashboardKeys.reviewedServices(user.id) });
        }
        return true;
      } else {
        alert('Error al enviar la reseña: ' + response.error);
        return false;
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error al enviar la reseña');
      return false;
    }
  };

  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
    setSelectedServiceForReview(null);
  };

  // Mostrar skeleton inmediatamente - no esperar a que todo cargue
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
      <div className="p-3 sm:p-4 md:p-6 max-w-full overflow-x-hidden">
        {/* Banner - Carga inmediata (no depende de datos pesados) */}
        <WelcomeBanner userName={userName || 'Usuario'} onCreateService={handleCrearServicio} />

        <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
          {/* Sección de servicios - Crítica, carga primero */}
          <div className="lg:col-span-2 min-w-0">
            <div className="bg-white rounded-2xl shadow-sm border p-4 md:p-6 w-full max-w-full overflow-hidden">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h3 className="text-lg md:text-xl font-bold text-gray-800">Mis Servicios</h3>
              </div>
              
              <div className="space-y-3 md:space-y-4">
                {!initialLoadComplete ? (
                  <SkeletonLoader type="service-card" count={3} />
                ) : services.length > 0 ? (
                  services.slice(0, 3).map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      categories={categories}
                      hasReviewed={reviewedServices[service.id] || false}
                      onViewDetails={handleVerDetalles}
                      onDelete={handleDeleteService}
                      onLeaveReview={handleLeaveReview}
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
                      className="bg-emerald-400 text-black px-4 py-2 rounded-lg hover:bg-emerald-500 transition-colors"
                    >
                      Crear Servicio
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profesionales destacados - Secundario, carga después con lazy loading */}
          <div className="lg:col-span-1 min-w-0">
            {!initialLoadComplete ? (
              <div className="bg-white rounded-2xl shadow-sm border p-4 md:p-6 w-full max-w-full overflow-hidden">
                <SkeletonLoader type="text" />
              </div>
            ) : (
              <Suspense fallback={
                <div className="bg-white rounded-2xl shadow-sm border p-4 md:p-6 w-full max-w-full overflow-hidden">
                  <SkeletonLoader type="text" />
                </div>
              }>
                <TopProfessionals professionals={topWorkers} />
              </Suspense>
            )}
          </div>
        </div>
      </div>

      {/* Modal de reseñas - Solo se carga cuando se necesita */}
      {showReviewModal && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={handleCloseReviewModal}
          onSubmit={handleSubmitReview}
          professionalName={selectedServiceForReview?.workerName || 'Trabajador'}
          serviceTitle={selectedServiceForReview?.title || ''}
        />
      )}
    </Layout>
  );
}
