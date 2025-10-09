import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { serviceService, applicationsService, questionsService } from '@/lib/services';
import { formatDate, formatPrice } from '@/lib/utils/empty-state-helpers';

export const useTrabajoDetalle = (serviceId: string) => {
  const router = useRouter();
  const [service, setService] = useState<any>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  useEffect(() => {
    if (serviceId) {
      loadServiceData();
      loadQuestions();
    }
  }, [serviceId]);

  const loadServiceData = async () => {
    if (!serviceId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Cargar servicio con timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 10000)
      );
      
      const servicePromise = serviceService.getById(serviceId);
      
      const serviceResponse = await Promise.race([servicePromise, timeoutPromise]) as any;
      
      if (serviceResponse.success && serviceResponse.data) {
        setService(serviceResponse.data);
      } else {
        alert('Error al cargar servicio: ' + (serviceResponse.error || 'Error desconocido'));
        setService(null);
      }

      // Verificar si ya aplicó (en paralelo, sin bloquear)
      applicationsService.getMyApplications().then(myApplicationsResponse => {
        if (myApplicationsResponse.success && myApplicationsResponse.data) {
          const applied = myApplicationsResponse.data.some(app => app.service_id === serviceId);
          setHasApplied(applied);
        }
      }).catch(err => {
        console.error('Error checking applications:', err);
      });

    } catch (error: any) {
      console.error('Error loading service:', error);
      if (error.message === 'Timeout') {
        alert('La carga del servicio está tomando demasiado tiempo. Por favor, intenta de nuevo.');
      } else {
        alert('Error al cargar el servicio');
      }
      setService(null);
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async () => {
    try {
      setLoadingQuestions(true);
      const response = await questionsService.getByService(serviceId);
      if (response.success && response.data) {
        setQuestions(response.data);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleAplicar = () => {
    if (hasApplied) {
      alert('Ya te has postulado a este trabajo');
      return;
    }
    setIsModalOpen(true);
  };

  const handleSubmitApplication = async (precio: number, coverLetter: string, estimatedDuration: string) => {
    try {
      const response = await applicationsService.create({
        service_id: serviceId,
        proposed_price: precio,
        cover_letter: coverLetter,
        estimated_duration: estimatedDuration
      });

      if (response.success) {
        setIsModalOpen(false);
        setHasApplied(true);
        setIsSuccessModalOpen(true);
      } else {
        alert('Error al enviar aplicación: ' + response.error);
      }
    } catch (error) {
      alert('Error al enviar la aplicación');
    }
  };

  const handleRedirectToDashboard = () => {
    setIsSuccessModalOpen(false);
    router.push('/worker/dashboard');
  };

  const handleCloseSuccessModal = () => {
    setIsSuccessModalOpen(false);
  };

  const handleSubmitQuestion = async (questionText: string) => {
    try {
      const response = await questionsService.create({
        service_id: serviceId,
        question: questionText,
        is_public: true
      });

      if (response.success) {
        await loadQuestions(); // Recargar preguntas
        return true;
      } else {
        alert('Error al enviar pregunta: ' + response.error);
        return false;
      }
    } catch (error) {
      alert('Error al enviar la pregunta');
      return false;
    }
  };

  return {
    service,
    hasApplied,
    loading,
    isModalOpen,
    setIsModalOpen,
    isSuccessModalOpen,
    setIsSuccessModalOpen,
    handleAplicar,
    handleSubmitApplication,
    handleRedirectToDashboard,
    handleCloseSuccessModal,
    questions,
    loadingQuestions,
    handleSubmitQuestion,
    formatDate,
    formatPrice
  };
};

