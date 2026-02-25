'use client';

import { useState, Suspense } from 'react';
import Layout from '@/components/Layout';
import { useDetallesPostulantes } from '@/hooks/useDetallesPostulantes';
import { ServiceDetails } from '@/components/ui/ServiceDetails';
import { PostulanteCard } from '@/components/ui/PostulanteCard';
import { PublicQuestionsSection } from '@/components/ui/PublicQuestionsSection';
import { CancelServiceModal } from '@/components/ui/CancelServiceModal';
import { WorkerSelectionModal } from '@/components/ui/WorkerSelectionModal';
import { ChevronDown, ChevronUp, MessageCircle, Users, Star, CheckCircle, User, Info, DollarSign } from 'lucide-react';
import { formatPrice } from '@/lib/utils/empty-state-helpers';

// Tipo para el servicio formateado que retorna el hook
type ServicioFormateado = {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  ubicacion: string;
  fechaPublicacion: string;
  fechaLimite: string;
  estado: 'activo' | 'en_proceso' | 'completado';
  postulantes: number;
  progreso: number;
  etapa: string;
  horariosDisponibilidad: string[];
  escrow_amount: number | null;
  images?: string[];
};

function DetallesPostulantesContent() {
  const [isQuestionsExpanded, setIsQuestionsExpanded] = useState(false); // Colapsado por defecto
  const [isPostulantesExpanded, setIsPostulantesExpanded] = useState(true); // Desplegada por defecto

  const {
    servicio,
    postulantes,
    preguntas,
    booking,
    selectedCandidate,
    showConfirmationModal,
    candidateToConfirm,
    showCancelServiceModal,
    loading,
    handleVerPerfil,
    handleBack,
    handleSelectCandidate,
    handleConfirmSelection,
    handleCloseModal,
    handleCancelService,
    handleConfirmCancelService,
    handleCloseCancelModal,
    handleAnswerQuestion
  } = useDetallesPostulantes();

  // Verificar si hay un trabajador seleccionado o aceptado
  const hasSelectedWorker = selectedCandidate || (postulantes.length === 1 && postulantes[0]?.estado === 'aprobado');
  const selectedWorker = hasSelectedWorker ? postulantes[0] : null;

  if (loading) {
    return (
      <Layout 
        title="Detalles de Postulantes" 
        showBackButton={true}
        onBackClick={handleBack}
      >
        <div className="p-6">
          <div className="flex flex-col items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-[#743fc6]/30 border-t-[#743fc6] rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 text-sm">Cargando detalles del servicio...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!servicio) {
    return (
      <Layout 
        title="Detalles de Postulantes" 
        showBackButton={true}
        onBackClick={handleBack}
      >
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600">
            No se pudo cargar el servicio. Por favor, intenta de nuevo.
          </div>
        </div>
      </Layout>
    );
  }

  // Función para mapear el estado al formato esperado por ServiceDetails
  const mapEstado = (status: string): 'activo' | 'en_proceso' | 'completado' => {
    if (status === 'hired' || status === 'in_progress') return 'en_proceso';
    if (status === 'completed' || status === 'completado') return 'completado';
    return 'activo';
  };

  // Mapear el servicio del hook al formato esperado por ServiceDetails
  const servicioFormateado: ServicioFormateado | null = servicio ? {
    id: servicio.id,
    titulo: servicio.titulo,
    descripcion: servicio.descripcion,
    categoria: servicio.categoria,
    ubicacion: servicio.ubicacion,
    fechaPublicacion: servicio.fechaPublicacion,
    fechaLimite: servicio.fechaLimite,
    estado: mapEstado(servicio.estado),
    postulantes: servicio.postulantes,
    progreso: servicio.progreso || (servicio.estado === 'completed' || servicio.estado === 'completado' ? 100 : servicio.estado === 'hired' || servicio.estado === 'in_progress' ? 50 : 25),
    etapa: servicio.etapa || (servicio.estado === 'completed' || servicio.estado === 'completado' ? 'Completado' : servicio.estado === 'hired' || servicio.estado === 'in_progress' ? 'En Proceso' : 'Buscando Trabajador'),
    horariosDisponibilidad: servicio.horariosDisponibilidad,
    escrow_amount: servicio.escrow_amount ?? null,
    images: servicio.images || []
  } : null;

  return (
    <Layout 
      title={hasSelectedWorker ? "Trabajador Seleccionado" : "Detalles de Postulantes"} 
      showBackButton={true}
      onBackClick={handleBack}
    >
      <div className="p-4 sm:p-6 bg-gradient-to-br from-purple-50/30 via-pink-50/30 to-blue-50/30 min-h-screen">
        {hasSelectedWorker ? (
          /* Vista cuando hay trabajador seleccionado */
          <div className="space-y-6">
            {/* Información del servicio */}
            {servicioFormateado && (
              <ServiceDetails 
                servicio={servicioFormateado} 
                getEstadoColor={(estado) => {
                  switch (estado) {
                    case 'aprobado':
                      return 'bg-green-100 text-green-800 border-green-200';
                    case 'rechazado':
                      return 'bg-red-100 text-red-800 border-red-200';
                    default:
                      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
                  }
                }}
                onCancelService={handleCancelService}
              />
            )}

            {/* Perfil del trabajador seleccionado */}
            {selectedWorker && (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-[0_8px_32px_rgba(116,63,198,0.08)] border border-white/30 overflow-hidden">
                {/* Header del trabajador */}
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                        {selectedWorker.foto ? (
                          <img 
                            src={selectedWorker.foto} 
                            alt={`${selectedWorker.nombre} ${selectedWorker.apellido}`}
                            className="w-14 h-14 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="w-14 h-14 bg-white/30 rounded-xl flex items-center justify-center">
                            <User size={24} className="text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">{selectedWorker.nombre} {selectedWorker.apellido}</h2>
                        <p className="text-purple-100">{selectedWorker.especialidad}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex items-center space-x-1">
                            <Star size={16} className="text-yellow-300" fill="currentColor" />
                            <span className="text-sm font-medium">{selectedWorker.calificacion.toFixed(1)}</span>
                          </div>
                          <span className="text-purple-100">•</span>
                          <span className="text-sm text-purple-100">{selectedWorker.serviciosCompletados} trabajos completados</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle size={24} className="text-green-300" />
                      <span className="text-sm font-medium">Seleccionado</span>
                    </div>
                  </div>
                </div>

                {/* Detalles del trabajador */}
                <div className="p-6 space-y-6">
                  {/* Precio pagado */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                      <DollarSign size={20} className="text-purple-500" />
                      <span>Precio Pagado</span>
                    </h3>
                    <p className="text-2xl font-bold text-purple-600">
                      {booking?.total_price 
                        ? formatPrice(booking.total_price)
                        : servicio?.escrow_amount 
                          ? formatPrice(servicio.escrow_amount)
                          : selectedWorker?.precio 
                            ? formatPrice(selectedWorker.precio)
                            : formatPrice(0)
                      }
                    </p>
                  </div>

                  {/* Mensaje informativo */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start space-x-3">
                    <Info size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-800">
                      Puedes comunicarte con el trabajador en la sección de <span className="font-semibold">chats</span>.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Vista original cuando no hay trabajador seleccionado */
          <div className="space-y-6">
            {/* Información del servicio */}
            {servicioFormateado && (
              <ServiceDetails 
                servicio={servicioFormateado} 
                getEstadoColor={(estado) => {
                  switch (estado) {
                    case 'aprobado':
                      return 'bg-green-100 text-green-800 border-green-200';
                    case 'rechazado':
                      return 'bg-red-100 text-red-800 border-red-200';
                    default:
                      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
                  }
                }}
                onCancelService={handleCancelService}
              />
            )}

            {/* Panel de preguntas públicas - Colapsado por defecto */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-[0_8px_32px_rgba(116,63,198,0.08)] border border-white/30">
              <button
                onClick={() => setIsQuestionsExpanded(!isQuestionsExpanded)}
                className="w-full flex items-center justify-between p-6 hover:bg-gray-50/50 transition-colors rounded-t-2xl"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                    <MessageCircle size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Preguntas Públicas</h3>
                    <p className="text-sm text-gray-600">
                      {preguntas.length} {preguntas.length === 1 ? 'pregunta' : 'preguntas'} de profesionales
                    </p>
                  </div>
                </div>
                {isQuestionsExpanded ? (
                  <ChevronUp size={20} className="text-gray-500" />
                ) : (
                  <ChevronDown size={20} className="text-gray-500" />
                )}
              </button>
              
              {isQuestionsExpanded && (
                <div className="px-6 pb-6">
                  <PublicQuestionsSection 
                    preguntas={preguntas} 
                    onAnswerQuestion={handleAnswerQuestion}
                    loading={loading}
                  />
                </div>
              )}
            </div>

            {/* Panel de postulantes - Colapsado por defecto */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-[0_8px_32px_rgba(116,63,198,0.08)] border border-white/30">
              <button
                onClick={() => setIsPostulantesExpanded(!isPostulantesExpanded)}
                className="w-full flex items-center justify-between p-6 hover:bg-gray-50/50 transition-colors rounded-t-2xl"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Users size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Postulantes</h3>
                    <p className="text-sm text-gray-600">
                      {postulantes.length} {postulantes.length === 1 ? 'profesional' : 'profesionales'} postulados
                    </p>
                  </div>
                </div>
                {isPostulantesExpanded ? (
                  <ChevronUp size={20} className="text-gray-500" />
                ) : (
                  <ChevronDown size={20} className="text-gray-500" />
                )}
              </button>
              
              {isPostulantesExpanded && (
                <div className="px-6 pb-6 space-y-4">
                  {postulantes.length > 0 ? (
                    postulantes.map((postulante) => (
                      <PostulanteCard
                        key={postulante.id}
                        postulante={postulante}
                        onVerPerfil={handleVerPerfil}
                        onSelectCandidate={handleSelectCandidate}
                        isSelected={selectedCandidate === postulante.id}
                      />
                    ))
                  ) : (
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-[0_8px_32px_rgba(116,63,198,0.08)] border border-white/30 p-8 text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">No se encontraron postulantes</h3>
                      <p className="text-base text-gray-600 mb-4">No hay postulantes disponibles para este servicio en este momento.</p>
                      <div className="bg-gradient-to-r from-purple-50/80 to-pink-50/80 rounded-xl p-3 border border-purple-200/30">
                        <p className="text-xs text-purple-600 font-medium">
                          Los profesionales aparecerán aquí cuando se postulen a tu servicio
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de selección de trabajador */}
      <WorkerSelectionModal
        isOpen={showConfirmationModal}
        onClose={handleCloseModal}
        onConfirm={handleConfirmSelection}
        postulante={candidateToConfirm}
        serviceTitle={servicio?.titulo || ''}
      />

      {/* Modal de cancelación de servicio */}
      <CancelServiceModal
        isOpen={showCancelServiceModal}
        onClose={handleCloseCancelModal}
        onConfirm={handleConfirmCancelService}
        serviceTitle={servicio?.titulo || ''}
      />
    </Layout>
  );
}

export default function DetallesPostulantesPage() {
  return (
    <Suspense fallback={
      <Layout 
        title="Detalles de Postulantes" 
        showBackButton={true}
        onBackClick={() => window.history.back()}
      >
        <div className="p-6">
          <div className="flex flex-col items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-[#743fc6]/30 border-t-[#743fc6] rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 text-sm">Cargando detalles del servicio...</p>
          </div>
        </div>
      </Layout>
    }>
      <DetallesPostulantesContent />
    </Suspense>
  );
} 