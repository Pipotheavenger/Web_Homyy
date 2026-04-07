import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { serviceService, applicationsService, bookingsService, questionsService, escrowService } from '@/lib/services';
import { chatService } from '@/lib/api/chat';
import { formatDate, formatPrice } from '@/lib/utils/empty-state-helpers';
import { useQueryClient } from '@tanstack/react-query';
import { dashboardKeys } from './queries/dashboardQueries';
import { clearCachedData } from '@/lib/cache-utils';
import { useAuth } from './useAuth';

export const useDetallesPostulantes = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceId = searchParams.get('id');
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [servicio, setServicio] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [preguntas, setPreguntas] = useState<any[]>([]);
  const [booking, setBooking] = useState<any>(null); // Booking para obtener precio pagado
  const [selectedFilter, setSelectedFilter] = useState('todos');
  const [selectedSort, setSelectedSort] = useState('reciente');
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [candidateToConfirm, setCandidateToConfirm] = useState<any>(null);
  const [showCancelServiceModal, setShowCancelServiceModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [candidateToReject, setCandidateToReject] = useState<any>(null);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (serviceId && user?.id) {
      setLoading(true);
      setError(null);
      Promise.allSettled([
        loadServiceDetails(),
        loadApplications(),
        loadPreguntas(),
        loadBooking()
      ]).finally(() => setLoading(false));
    } else if (!serviceId) {
      setLoading(false);
    } else if (serviceId && !user?.id) {
      // Auth not available yet — timeout to prevent infinite loading
      const timeout = setTimeout(() => {
        setLoading(false);
        setError('No se pudo verificar tu sesión. Recarga la página.');
      }, 10_000);
      return () => clearTimeout(timeout);
    }
  }, [serviceId, user?.id]);

  const loadServiceDetails = async () => {
    if (!serviceId) return;

    try {
      // Query directa simple sin relaciones
      const { data: serviceData, error: serviceError } = await supabase
        .from('services')
        .select('*')
        .eq('id', serviceId)
        .single();

      if (serviceError) {
        throw serviceError;
      }

      // Cargar categoría separadamente si existe
      if (serviceData.category_id) {
        const { data: categoryData } = await supabase
          .from('categories')
          .select('*')
          .eq('id', serviceData.category_id)
          .single();
        
        serviceData.category = categoryData;
      }

      // Cargar schedules separadamente
      const { data: schedules } = await supabase
        .from('service_schedules')
        .select('*')
        .eq('service_id', serviceId);
      
      serviceData.schedules = schedules || [];

      setServicio(serviceData);

    } catch (error: any) {
      console.error('Error al cargar servicio:', error);
      setError('Error al cargar los detalles del servicio');
      setServicio(null);
    }
  };

  const loadApplications = async () => {
    if (!serviceId) return;

    try {
      console.log('🔄 Cargando aplicaciones para servicio:', serviceId);
      const response = await applicationsService.getByService(serviceId);
      console.log('📥 Respuesta del servicio:', response);
      
      if (response.success && response.data) {
        console.log('✅ Aplicaciones cargadas:', response.data);
        setApplications(response.data);
      } else {
        console.error('❌ Error en la respuesta:', response.error);
        setApplications([]);
      }
    } catch (error) {
      console.error('❌ Error loading applications:', error);
    }
  };

  const loadPreguntas = async () => {
    if (!serviceId) return;

    try {
      const response = await questionsService.getByService(serviceId);
      if (response.success && response.data) {
        setPreguntas(response.data);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
    }
  };

  const loadBooking = async () => {
    if (!serviceId) return;

    try {
      // Buscar booking relacionado con este servicio
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select('id, total_price, created_at, status, payment_status')
        .eq('service_id', serviceId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!bookingError && bookingData) {
        setBooking(bookingData);
      }
    } catch (error) {
      console.error('Error loading booking:', error);
    }
  };

  // Filtrar y ordenar postulantes
  const filteredPostulantes = useMemo(() => {
    if (!applications) return [];

    // Primero excluir aplicaciones retiradas (withdrawn) y rechazadas (rejected)
    let filtered = applications.filter(app => app.status !== 'withdrawn' && app.status !== 'rejected');

    // Luego aplicar el filtro seleccionado
    filtered = filtered.filter(app => {
      if (selectedFilter === 'todos') return true;
      if (selectedFilter === 'pendiente') return app.status === 'pending';
      if (selectedFilter === 'aprobado') return app.status === 'accepted';
      if (selectedFilter === 'rechazado') return app.status === 'rejected';
      return true;
    });

    // Si hay candidato seleccionado o un trabajador aceptado, mostrar solo ese
    if (selectedCandidate) {
      filtered = filtered.filter(app => app.id === selectedCandidate);
    } else {
      // Si no hay candidato seleccionado pero hay uno aceptado, mostrarlo
      const acceptedApplication = filtered.find(app => app.status === 'accepted');
      if (acceptedApplication) {
        filtered = [acceptedApplication];
      }
    }

    // Ordenar
    switch (selectedSort) {
      case 'reciente':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'experiencia':
        filtered.sort((a, b) => (b.worker_profile?.experience_years || 0) - (a.worker_profile?.experience_years || 0));
        break;
      case 'calificacion':
        filtered.sort((a, b) => Number(b.worker_profile?.rating || 0) - Number(a.worker_profile?.rating || 0));
        break;
    }

    // Mapear a formato esperado por el componente
    return filtered.map(app => {
      console.log('📊 Mapeando aplicación:', {
        id: app.id,
        proposed_price: app.proposed_price,
        worker: app.worker,
        worker_profile: app.worker_profile
      });
      
      return {
        id: app.id,
        workerId: app.worker_id, // ID del trabajador para ver perfil
        nombre: app.worker?.name?.split(' ')[0] || 'Trabajador',
        apellido: app.worker?.name?.split(' ').slice(1).join(' ') || '',
        especialidad: app.worker_profile?.profession || 'No especificado',
        experiencia: app.worker_profile?.experience_years || 0,
        calificacion: Number(app.worker_profile?.rating || 0),
        serviciosCompletados: app.worker_profile?.total_services || 0,
        ubicacion: app.worker_profile?.location || 'No especificado',
        disponibilidad: app.worker_profile?.is_available ? 'Disponible' : 'No disponible',
        foto: app.worker?.profile_picture_url || '',
        estado: (() => {
          switch (app.status) {
            case 'pending': return 'pendiente' as const;
            case 'accepted': return 'aprobado' as const;
            default: return 'rechazado' as const;
          }
        })(),
        fechaPostulacion: formatDate(app.created_at),
        telefono: app.worker?.phone || '',
        email: app.worker?.email || '',
        precio: Number(app.proposed_price || 0),
        coverLetter: app.cover_letter,
        estimatedDuration: app.estimated_duration
      };
    });
  }, [applications, selectedFilter, selectedSort, selectedCandidate]);

  const handleVerPerfil = (profesionalId: string) => {
    router.push(`/user/perfil-profesional?id=${profesionalId}`);
  };

  const handleBack = () => {
    router.back();
  };

  const handleSelectCandidate = async (candidateId: string) => {
    console.log('🔍 Buscando candidato con ID:', candidateId);
    console.log('📋 Postulantes disponibles:', filteredPostulantes);
    
    const candidate = filteredPostulantes.find(p => p.id === candidateId);
    console.log('✅ Candidato encontrado:', candidate);
    
    if (candidate) {
      setCandidateToConfirm(candidate);
      setShowConfirmationModal(true);
    } else {
      console.error('❌ No se encontró el candidato con ID:', candidateId);
    }
  };

  const handleConfirmSelection = async (): Promise<boolean> => {
    if (!candidateToConfirm || !serviceId) return false;

    try {
      // Usar el servicio de escrow para seleccionar trabajador
      const response = await escrowService.selectWorker(
        serviceId,
        candidateToConfirm.workerId,
        candidateToConfirm.id,
        candidateToConfirm.precio
      );
      
      if (response.success) {
        // Obtener el booking que se acaba de crear
        const { data: bookings } = await supabase
          .from('bookings')
          .select('id')
          .eq('service_id', serviceId)
          .eq('worker_id', candidateToConfirm.workerId)
          .order('created_at', { ascending: false })
          .limit(1);

        // Crear el chat automáticamente
        if (bookings && bookings.length > 0) {
          const bookingId = bookings[0].id;
          await chatService.getOrCreateChat(bookingId);

          // Notificar al trabajador por WhatsApp que fue seleccionado
          try {
            const { notifyClientSelectedYou, notifyApplicationRejected } = await import('@/lib/utils/notificationHelpers');
            const clientName = user?.user_metadata?.name || 'Un cliente';
            await notifyClientSelectedYou(
              candidateToConfirm.workerId,
              clientName,
              servicio?.title || 'el servicio',
              bookingId
            );

            // Notificar a los demás postulantes no seleccionados
            const otherApplicants = applications.filter(
              (app) => app.worker_id !== candidateToConfirm.workerId && app.status === 'pending'
            );
            for (const app of otherApplicants) {
              try {
                const workerName = app.worker?.name || app.worker?.full_name || 'Profesional';
                await notifyApplicationRejected(
                  app.worker_id,
                  workerName,
                  servicio?.title || 'el servicio',
                  serviceId
                );
              } catch (rejectError) {
                console.warn('⚠️ Error notificando rechazo a trabajador:', app.worker_id, rejectError);
              }
            }
          } catch (notifError) {
            console.warn('⚠️ Error enviando notificaciones:', notifError);
          }
        }

        setSelectedCandidate(candidateToConfirm.id);
        setShowConfirmationModal(false);
        setCandidateToConfirm(null);
        
        // Invalidar caché de servicios para que se recargue con el PIN
        if (user?.id) {
          queryClient.invalidateQueries({ queryKey: dashboardKeys.services(user.id) });
          // Limpiar caché local también
          clearCachedData(`user_services_${user.id}`);
        }
        
        // Recargar datos
        await loadServiceDetails();
        await loadApplications();
        await loadBooking();
        
        alert(`Trabajador seleccionado exitosamente. PIN de finalización: ${response.data?.pin}`);
        
        // Redirigir automáticamente al dashboard después de 2 segundos
        setTimeout(() => {
          router.push('/user/dashboard');
        }, 2000);
        
        return true; // Indicar éxito
      } else {
        // Manejar error específico de saldo insuficiente
        if (response.error?.includes('Saldo insuficiente')) {
          const creativeMessage = `💰 ¡Ups! Tu saldo actual no es suficiente para contratar este servicio.

💡 Te sugerimos:
• Recargar tu saldo desde la sección de pagos
• Verificar el monto total (incluye comisiones)
• ¡No te preocupes! Tu trabajador ideal te esperará

¿Te gustaría ir a recargar tu saldo ahora?`;
          
          if (confirm(creativeMessage)) {
            router.push('/user/pagos');
          }
        } else {
          alert('Error al seleccionar candidato: ' + response.error);
        }
        return false; // Indicar fallo
      }
    } catch (error) {
      alert('Error al confirmar selección');
      return false; // Indicar fallo
    }
  };

  const handleCloseModal = () => {
    setShowConfirmationModal(false);
    setCandidateToConfirm(null);
  };

  const handleDeselectCandidate = () => {
    setSelectedCandidate(null);
  };

  const handleCancelService = () => {
    setShowCancelServiceModal(true);
  };

  const handleConfirmCancelService = async () => {
    if (!serviceId) return;

    try {
      const response = await serviceService.update(serviceId, { status: 'cancelled' });
      if (response.success) {
        setShowCancelServiceModal(false);
        alert('Servicio cancelado exitosamente');
        router.push('/user/dashboard');
      } else {
        alert('Error al cancelar servicio');
      }
    } catch (error) {
      alert('Error al cancelar el servicio');
    }
  };

  const handleCloseCancelModal = () => {
    setShowCancelServiceModal(false);
  };

  const handleRejectCandidate = (candidateId: string) => {
    const candidate = filteredPostulantes.find(p => p.id === candidateId);
    if (candidate) {
      setCandidateToReject(candidate);
      setShowRejectModal(true);
    }
  };

  const handleConfirmReject = async () => {
    if (!candidateToReject || !serviceId) return;

    setRejectLoading(true);
    try {
      const response = await applicationsService.reject(candidateToReject.id);

      if (response.success) {
        // Enviar notificación al trabajador
        try {
          const { notifyApplicationRejected } = await import('@/lib/utils/notificationHelpers');
          await notifyApplicationRejected(
            candidateToReject.workerId,
            candidateToReject.nombre,
            servicio?.title || 'el servicio',
            serviceId
          );
        } catch (notifError) {
          console.warn('⚠️ Error enviando notificación de rechazo:', notifError);
        }

        setShowRejectModal(false);
        setCandidateToReject(null);
        await loadApplications();
      } else {
        alert('Error al rechazar postulante: ' + response.error);
      }
    } catch (error) {
      alert('Error al rechazar al postulante');
    } finally {
      setRejectLoading(false);
    }
  };

  const handleCloseRejectModal = () => {
    setShowRejectModal(false);
    setCandidateToReject(null);
  };

  const handleAnswerQuestion = async (questionId: string, answer: string): Promise<boolean> => {
    try {
      const response = await questionsService.answer(questionId, { answer });
      if (response.success) {
        await loadPreguntas(); // Recargar preguntas
        return true;
      } else {
        alert('Error al responder pregunta: ' + response.error);
        return false;
      }
    } catch (error) {
      alert('Error al responder la pregunta');
      return false;
    }
  };

  // Preparar datos del servicio en formato esperado
  const servicioFormatted = servicio ? {
    id: servicio.id,
    titulo: servicio.title,
    descripcion: servicio.description || 'Sin descripción',
    categoria: servicio.category?.name || 'Sin categoría',
    ubicacion: servicio.location || 'No especificado',
    fechaPublicacion: formatDate(servicio.created_at),
    fechaLimite: 'No especificado',
    estado: servicio.status,
    postulantes: filteredPostulantes.length,
    progreso: 0,
    etapa: servicio.status === 'active' ? 'Contratando' : 
           servicio.status === 'hired' ? 'Contratado' : 
           servicio.status === 'completed' ? 'Completado' : 'Activo',
    horariosDisponibilidad: servicio.schedules?.map((s: any) =>
      `${s.date_available}: ${s.start_time} - ${s.end_time}`
    ) || [],
    escrow_amount: servicio.escrow_amount
  } : null;

  return {
    servicio: servicioFormatted,
    postulantes: filteredPostulantes,
    preguntas,
    booking, // Booking para obtener precio pagado
    error,
    selectedFilter,
    selectedSort,
    selectedCandidate,
    showConfirmationModal,
    candidateToConfirm,
    showCancelServiceModal,
    loading,
    setSelectedFilter,
    setSelectedSort,
    handleVerPerfil,
    handleBack,
    handleSelectCandidate,
    handleConfirmSelection,
    handleCloseModal,
    handleDeselectCandidate,
    handleCancelService,
    handleConfirmCancelService,
    handleCloseCancelModal,
    showRejectModal,
    candidateToReject,
    rejectLoading,
    handleRejectCandidate,
    handleConfirmReject,
    handleCloseRejectModal,
    loadPreguntas,
    handleAnswerQuestion
  };
};
