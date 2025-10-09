'use client';
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  User,
  MessageCircle,
  Send,
  Star,
  Shield,
  CheckCircle,
  Phone,
  Mail,
  MessageSquare
} from 'lucide-react';
import Layout from '@/components/Layout';
import { useUserType } from '@/contexts/UserTypeContext';
import { ApplicationModal } from '@/components/ui/ApplicationModal';
import { SuccessApplicationModal } from '@/components/ui/SuccessApplicationModal';
import { useTrabajoDetalle } from '@/hooks/useTrabajoDetalle';

interface TrabajoDetalle {
  id: string;
  titulo: string;
  descripcion: string;
  descripcionCompleta: string;
  precio: number;
  ubicacion: string;
  fecha: string;
  categoria: string;
  cliente: {
    nombre: string;
    verificado: boolean;
    telefono: string;
    email: string;
    calificacion: number;
    trabajosCompletados: number;
    fechaRegistro: string;
  };
  tiempoEstimado: string;
  requisitos: string[];
  materiales: string[];
  preguntas: Pregunta[];
}

interface Pregunta {
  id: string;
  pregunta: string;
  respuesta?: string;
  fecha: string;
  respondida: boolean;
}

export default function DetalleTrabajoPage() {
  const router = useRouter();
  const params = useParams();
  const { colors } = useUserType();
  const serviceId = params.id as string;
  
  const {
    service,
    hasApplied,
    loading,
    isModalOpen,
    setIsModalOpen,
    isSuccessModalOpen,
    handleAplicar,
    handleSubmitApplication,
    handleRedirectToDashboard,
    handleCloseSuccessModal,
    questions,
    loadingQuestions,
    handleSubmitQuestion,
    formatDate: formatDateUtil,
    formatPrice: formatPriceUtil
  } = useTrabajoDetalle(serviceId);

  const [nuevaPregunta, setNuevaPregunta] = useState('');
  const [submittingQuestion, setSubmittingQuestion] = useState(false);

  const handleEnviarPregunta = async () => {
    if (nuevaPregunta.trim() && !submittingQuestion) {
      setSubmittingQuestion(true);
      const success = await handleSubmitQuestion(nuevaPregunta);
      if (success) {
        setNuevaPregunta('');
      }
      setSubmittingQuestion(false);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Hace un momento';
    if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} minutos`;
    if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} horas`;
    return `Hace ${Math.floor(seconds / 86400)} días`;
  };

  if (loading || !service) {
    return (
      <Layout currentPage="trabajos">
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentPage="trabajos">
      <div className="p-4 md:p-6 space-y-6">
        {/* Header con botón de regreso */}
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-300"
          >
            <ArrowLeft size={20} />
            <span>Volver</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información principal del trabajo */}
          <div className="lg:col-span-2 space-y-6">
            {/* Detalles del trabajo */}
            <div className={`${colors.card} rounded-2xl p-6 border ${colors.border}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    {service.title}
                  </h1>
                  <div className="flex items-center flex-wrap gap-3 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <MapPin size={16} />
                      <span>{service.location || 'No especificado'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar size={16} />
                      <span>{formatDateUtil(service.created_at)}</span>
                    </div>
                    {service.category && (
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                        {service.category.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Descripción del trabajo</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {service.description || 'Sin descripción detallada'}
                  </p>
                </div>

                {service.schedules && service.schedules.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Horarios Disponibles</h4>
                    <ul className="space-y-2">
                      {service.schedules.map((schedule: any) => (
                        <li key={schedule.id} className="flex items-center space-x-2 text-sm text-gray-600">
                          <Clock size={14} className="text-orange-500" />
                          <span>{schedule.date_available}: {schedule.start_time} - {schedule.end_time}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Sección de preguntas */}
            <div className={`${colors.card} rounded-2xl p-6 border ${colors.border}`}>
              <div className="flex items-center space-x-2 mb-4">
                <MessageCircle size={20} className="text-orange-500" />
                <h3 className="text-lg font-semibold text-gray-800">Preguntas y respuestas</h3>
              </div>

              {/* Formulario para nueva pregunta */}
              <div className="mb-6">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Escribe tu pregunta sobre este trabajo..."
                    value={nuevaPregunta}
                    onChange={(e) => setNuevaPregunta(e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-300 outline-none"
                    onKeyPress={(e) => e.key === 'Enter' && !submittingQuestion && handleEnviarPregunta()}
                    disabled={submittingQuestion}
                  />
                  <button
                    onClick={handleEnviarPregunta}
                    disabled={!nuevaPregunta.trim() || submittingQuestion}
                    className="px-4 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    {submittingQuestion ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <Send size={16} />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Esta pregunta será pública y visible para todos</p>
              </div>

              {/* Lista de preguntas */}
              <div className="space-y-4">
                {loadingQuestions ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Cargando preguntas...</p>
                  </div>
                ) : questions.length > 0 ? (
                  questions.map((question) => (
                    <div key={question.id} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <MessageSquare size={16} className="text-blue-500" />
                          <span className="text-sm font-medium text-gray-800">
                            {question.user?.name || 'Usuario'}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">{getTimeAgo(question.created_at)}</span>
                      </div>
                      <p className="text-gray-700 mb-3">{question.question}</p>
                      
                      {question.answer && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <User size={16} className="text-green-600" />
                            <span className="text-sm font-medium text-green-800">Respuesta del cliente</span>
                          </div>
                          <p className="text-green-700 text-sm">{question.answer}</p>
                        </div>
                      )}
                      
                      {!question.answer && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <div className="flex items-center space-x-2">
                            <Clock size={16} className="text-yellow-600" />
                            <span className="text-sm text-yellow-700">Esperando respuesta del cliente</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <MessageCircle size={48} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">No hay preguntas aún</p>
                    <p className="text-sm text-gray-500 mt-1">Sé el primero en preguntar sobre este trabajo</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar con información del cliente */}
          <div className="space-y-6">
            {/* Información del cliente */}
            <div className={`${colors.card} rounded-2xl p-6 border ${colors.border}`}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  {service.client?.profile_picture_url ? (
                    <img 
                      src={service.client.profile_picture_url} 
                      alt={service.client.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-lg">
                      {service.client?.name?.split(' ').map((n: string) => n[0]).join('') || 'CL'}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{service.client?.name || 'Cliente'}</h3>
                  <p className="text-sm text-gray-600">Publicado {formatDateUtil(service.created_at)}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Shield size={16} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Estado del servicio</p>
                    <p className="text-sm text-green-600 font-medium capitalize">
                      {service.status === 'active' ? 'Activo - Buscando profesional' : service.status}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Botón de aplicar */}
            <div className={`${colors.card} rounded-2xl p-6 border ${colors.border}`}>
              <button
                onClick={handleAplicar}
                disabled={hasApplied}
                className={`w-full py-3 ${hasApplied ? 'bg-gray-400' : colors.gradient} text-white rounded-xl font-semibold hover:opacity-80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {hasApplied ? 'Ya aplicaste a este trabajo' : 'Aplicar a este trabajo'}
              </button>
              <p className="text-xs text-gray-500 text-center mt-2">
                {hasApplied ? 'Revisa tu aplicación en "Mis Aplicaciones"' : 'Establece tu precio y envía tu aplicación'}
              </p>
            </div>
          </div>
                 </div>
       </div>

       {/* Modal de aplicación */}
       <ApplicationModal
         isOpen={isModalOpen}
         onClose={() => setIsModalOpen(false)}
         trabajo={{
           titulo: service.title,
           descripcion: service.description || ''
         }}
         onSubmit={handleSubmitApplication}
       />

       {/* Modal de éxito */}
       <SuccessApplicationModal
         isOpen={isSuccessModalOpen}
         onClose={handleCloseSuccessModal}
         onRedirect={handleRedirectToDashboard}
         serviceTitle={service.title}
       />
     </Layout>
   );
 }
