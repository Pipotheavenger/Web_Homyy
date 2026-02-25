import { notificationService, type NotificationType } from '@/lib/api/notifications';
import { supabase } from '@/lib/supabase';

/**
 * Funciones helper para crear notificaciones automáticamente
 * Estas funciones se llaman desde el backend o mediante funciones RPC
 */

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, any>;
  isCritical?: boolean;
}

/**
 * Crear una notificación para un usuario
 */
export const createNotification = async (params: CreateNotificationParams) => {
  try {
    console.log('📝 Intentando crear notificación:', params);
    
    const response = await notificationService.createNotification({
      user_id: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      metadata: params.metadata || {},
      is_critical: params.isCritical || false
    });

    console.log('📝 Respuesta de createNotification:', response);
    
    if (!response.success) {
      console.error('❌ Error en respuesta:', response.error);
      return { 
        success: false, 
        error: response.error || 'Error desconocido al crear notificación' 
      };
    }
    
    return response;
  } catch (error) {
    console.error('❌ Excepción al crear notificación:', error);
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Error desconocido al crear notificación';
    return { success: false, error: errorMessage };
  }
};

/**
 * Crear notificación cuando un profesional aplica a un servicio (CLIENTE)
 */
export const notifyNewProfessionalApplication = async (
  clientId: string,
  professionalName: string,
  serviceTitle: string,
  applicationId: string
) => {
  return createNotification({
    userId: clientId,
    type: 'new_professional_applied',
    title: 'Nueva aplicación',
    message: `${professionalName} aplicó a tu solicitud de ${serviceTitle}`,
    metadata: {
      application_id: applicationId,
      service_title: serviceTitle,
      professional_name: professionalName
    }
  });
};

/**
 * Crear notificación cuando un profesional cancela su aplicación (CLIENTE)
 */
export const notifyProfessionalCancelledApplication = async (
  clientId: string,
  professionalName: string,
  serviceTitle: string
) => {
  return createNotification({
    userId: clientId,
    type: 'professional_cancelled_application',
    title: 'Aplicación cancelada',
    message: `${professionalName} ya no está disponible para tu servicio de ${serviceTitle}`,
    metadata: {
      service_title: serviceTitle,
      professional_name: professionalName
    }
  });
};

/**
 * Crear notificación cuando un cliente selecciona a un profesional (PROFESIONAL)
 */
export const notifyClientSelectedYou = async (
  workerId: string,
  clientName: string,
  serviceTitle: string,
  bookingId: string
) => {
  return createNotification({
    userId: workerId,
    type: 'client_selected_you',
    title: '¡Felicidades!',
    message: `Fuiste seleccionado para el servicio de ${serviceTitle}`,
    metadata: {
      booking_id: bookingId,
      service_title: serviceTitle,
      client_name: clientName
    },
    isCritical: true
  });
};

/**
 * Crear notificación cuando llega un nuevo mensaje
 */
export const notifyNewMessage = async (
  userId: string,
  senderName: string,
  chatId: string,
  messagePreview: string
) => {
  // Determinar el tipo de notificación según el rol del usuario
  // Para clientes: 'new_message', para profesionales: 'new_client_message'
  const notificationType: 'new_message' | 'new_client_message' = 'new_message';
  
  return createNotification({
    userId,
    type: notificationType,
    title: 'Nuevo mensaje',
    message: `${senderName}: ${messagePreview.substring(0, 50)}${messagePreview.length > 50 ? '...' : ''}`,
    metadata: {
      chat_id: chatId,
      sender_name: senderName
    }
  });
};

/**
 * Crear notificación cuando se completa un servicio
 */
export const notifyServiceCompleted = async (
  userId: string,
  serviceTitle: string,
  bookingId: string,
  isClient: boolean
) => {
  return createNotification({
    userId,
    type: 'service_completed',
    title: 'Servicio completado',
    message: isClient
      ? `El profesional marcó el servicio "${serviceTitle}" como completado. ¿Confirmas?`
      : `El cliente confirmó la finalización del servicio "${serviceTitle}"`,
    metadata: {
      booking_id: bookingId,
      service_title: serviceTitle
    }
  });
};

/**
 * Crear notificación cuando se procesa un pago
 */
export const notifyPaymentProcessed = async (
  userId: string,
  amount: number,
  transactionId: string,
  isClient: boolean
) => {
  const formattedAmount = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(amount);

  return createNotification({
    userId,
    type: isClient ? 'payment_processed' : 'payment_released',
    title: isClient ? 'Pago procesado' : 'Pago liberado',
    message: isClient
      ? `Tu pago de ${formattedAmount} fue procesado exitosamente`
      : `Recibiste ${formattedAmount} por tu servicio`,
    metadata: {
      transaction_id: transactionId,
      amount
    },
    isCritical: true // Marcar como crítica para asegurar envío por WhatsApp
  });
};

/**
 * Crear notificación cuando hay un problema con el pago
 */
export const notifyPaymentIssue = async (
  userId: string,
  errorMessage: string,
  transactionId?: string
) => {
  return createNotification({
    userId,
    type: 'payment_issue',
    title: 'Problema con el pago',
    message: errorMessage,
    metadata: {
      transaction_id: transactionId
    },
    isCritical: true
  });
};

/**
 * Crear notificación cuando se cancela un servicio
 */
export const notifyServiceCancelled = async (
  userId: string,
  serviceTitle: string,
  bookingId: string,
  cancelledBy: 'client' | 'worker'
) => {
  return createNotification({
    userId,
    type: 'service_cancelled',
    title: 'Servicio cancelado',
    message: `El servicio "${serviceTitle}" fue cancelado ${cancelledBy === 'client' ? 'por el cliente' : 'por el profesional'}`,
    metadata: {
      booking_id: bookingId,
      service_title: serviceTitle,
      cancelled_by: cancelledBy
    },
    isCritical: true
  });
};

/**
 * Crear notificación cuando hay un nuevo servicio disponible (PROFESIONAL)
 */
export const notifyNewServiceAvailable = async (
  workerId: string,
  serviceTitle: string,
  serviceId: string,
  location: string
) => {
  return createNotification({
    userId: workerId,
    type: 'new_service_available',
    title: 'Nueva oportunidad',
    message: `Nueva solicitud de ${serviceTitle} en ${location}`,
    metadata: {
      service_id: serviceId,
      service_title: serviceTitle,
      location
    }
  });
};

/**
 * Crear notificación cuando un profesional confirma asistencia (CLIENTE)
 */
export const notifyProfessionalConfirmedAttendance = async (
  clientId: string,
  professionalName: string,
  serviceTitle: string,
  dateTime: string,
  bookingId: string
) => {
  return createNotification({
    userId: clientId,
    type: 'professional_confirmed_attendance',
    title: 'Confirmación de asistencia',
    message: `${professionalName} confirmó para ${dateTime}`,
    metadata: {
      booking_id: bookingId,
      service_title: serviceTitle,
      professional_name: professionalName,
      date_time: dateTime
    }
  });
};

/**
 * Crear notificación cuando un profesional está en camino (CLIENTE)
 */
export const notifyProfessionalOnTheWay = async (
  clientId: string,
  professionalName: string,
  serviceTitle: string,
  bookingId: string
) => {
  return createNotification({
    userId: clientId,
    type: 'professional_on_the_way',
    title: 'En camino',
    message: `${professionalName} está en camino a tu ubicación`,
    metadata: {
      booking_id: bookingId,
      service_title: serviceTitle,
      professional_name: professionalName
    }
  });
};

/**
 * Crear notificación cuando se recibe una nueva calificación
 */
export const notifyNewReview = async (
  userId: string,
  reviewerName: string,
  rating: number,
  serviceTitle: string
) => {
  return createNotification({
    userId,
    type: 'new_review_received',
    title: 'Nueva calificación',
    message: `${reviewerName} te calificó con ${rating} estrellas${serviceTitle ? ` por "${serviceTitle}"` : ''}`,
    metadata: {
      reviewer_name: reviewerName,
      rating,
      service_title: serviceTitle
    }
  });
};

/**
 * Crear notificación cuando se aprueba/rechaza la verificación de cuenta
 */
export const notifyAccountVerification = async (
  userId: string,
  approved: boolean
) => {
  return createNotification({
    userId,
    type: approved ? 'account_verification_approved' : 'account_verification_rejected',
    title: approved ? 'Verificación aprobada' : 'Verificación rechazada',
    message: approved
      ? 'Tu cuenta ha sido verificada exitosamente'
      : 'Tu solicitud de verificación fue rechazada. Revisa los documentos y vuelve a intentar.',
    isCritical: !approved
  });
};

/**
 * Crear notificación de recordatorio (sin aplicaciones, confirmar finalización, etc.)
 */
export const notifyReminder = async (
  userId: string,
  type: 'no_applications_reminder' | 'confirm_completion_reminder' | 'rate_professional_reminder' | 'service_upcoming_reminder',
  message: string,
  metadata?: Record<string, any>
) => {
  const titles = {
    no_applications_reminder: 'Recordatorio',
    confirm_completion_reminder: 'Pendiente de confirmación',
    rate_professional_reminder: 'Califica tu experiencia',
    service_upcoming_reminder: 'Servicio próximo'
  };

  return createNotification({
    userId,
    type,
    title: titles[type],
    message,
    metadata: metadata || {}
  });
};

