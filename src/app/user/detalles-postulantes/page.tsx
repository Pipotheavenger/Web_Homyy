'use client';

import { useState } from 'react';
import Layout from '@/components/Layout';
import { useDetallesPostulantes } from '@/hooks/useDetallesPostulantes';
import { ServiceDetails } from '@/components/ui/ServiceDetails';
import { PostulanteCard } from '@/components/ui/PostulanteCard';
import { PublicQuestionsSection } from '@/components/ui/PublicQuestionsSection';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { CancelServiceModal } from '@/components/ui/CancelServiceModal';
import { ChevronDown, ChevronUp, MessageCircle, Users } from 'lucide-react';

export default function DetallesPostulantesPage() {
  const [isQuestionsExpanded, setIsQuestionsExpanded] = useState(true); // Expandido por defecto
  const [isPostulantesExpanded, setIsPostulantesExpanded] = useState(false); // Colapsado por defecto

  const {
    servicio,
    postulantes,
    preguntas,
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
    handleDeselectCandidate,
    handleCancelService,
    handleConfirmCancelService,
    handleCloseCancelModal,
    handleAnswerQuestion
  } = useDetallesPostulantes();

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

  return (
    <Layout 
      title="Detalles de Postulantes" 
      showBackButton={true}
      onBackClick={handleBack}
    >
      <div className="p-4 sm:p-6 bg-gradient-to-br from-purple-50/30 via-pink-50/30 to-blue-50/30 min-h-screen">
        {/* Información del servicio */}
        <ServiceDetails 
          servicio={servicio} 
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

        {/* Panel de preguntas públicas - Expandido por defecto */}
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
              {selectedCandidate && postulantes.length === 1 && (
                <div className="bg-gradient-to-r from-green-50/80 to-blue-50/80 rounded-xl p-3 border border-green-200/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-blue-400 rounded-lg flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-sm font-semibold text-green-700">
                        Candidato seleccionado - Solo mostrando el profesional elegido
                      </span>
                    </div>
                    <button
                      onClick={handleDeselectCandidate}
                      className="text-xs text-green-600 hover:text-green-700 font-medium underline"
                    >
                      Ver todos los candidatos
                    </button>
                  </div>
                </div>
              )}

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

      {/* Modal de confirmación */}
      <ConfirmationModal
        isOpen={showConfirmationModal}
        onClose={handleCloseModal}
        onConfirm={handleConfirmSelection}
        candidateName={candidateToConfirm ? `${candidateToConfirm.nombre} ${candidateToConfirm.apellido}` : ''}
        candidateSpecialty={candidateToConfirm?.especialidad || ''}
        candidatePrice={candidateToConfirm?.precio || 0}
      />

      {/* Modal de cancelación de servicio */}
      <CancelServiceModal
        isOpen={showCancelServiceModal}
        onClose={handleCloseCancelModal}
        onConfirm={handleConfirmCancelService}
        serviceTitle={servicio.titulo}
      />
    </Layout>
  );
} 