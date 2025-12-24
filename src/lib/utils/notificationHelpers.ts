import { notificationService, type NotificationType } from '@/lib/api/notifications';
import { supabase } from '@/lib/supabase';

/**
 * Verificar si un tipo de notificación está habilitado
 */
async function isNotificationTypeEnabled(notificationType: NotificationType): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('notification_settings')
      .select('enabled')
      .eq('notification_type', notificationType)
      .single();

    if (error || !data) {
      // Si no existe la configuración, asumir que está habilitado (comportamiento por defecto)
      return true;
    }

    return data.enabled === true;
  } catch (error) {
    console.error('Error verificando configuración de notificación:', error);
    // En caso de error, permitir la notificación por defecto
    return true;
  }
}

/**
 * Verificar si SMS Auth está habilitado
 */
async function isSmsAuthEnabled(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'sms_auth_enabled')
      .single();

    if (error || !data?.value) {
      // Si no existe la configuración, asumir que está habilitado (comportamiento por defecto)
      return true;
    }

    return data.value.enabled === true;
  } catch (error) {
    console.error('Error verificando configuración de SMS Auth:', error);
    // En caso de error, permitir SMS Auth por defecto
    return true;
  }
}

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
 * También envía por WhatsApp si está habilitado
 */
export const createNotification = async (params: CreateNotificationParams) => {
  try {
    // Verificar si este tipo de notificación está habilitado
    const isEnabled = await isNotificationTypeEnabled(params.type);
    if (!isEnabled) {
      console.log(`⚠️ Notificación ${params.type} está deshabilitada, omitiendo...`);
      return { 
        success: true, 
        skipped: true,
        message: 'Notificación deshabilitada por configuración' 
      };
    }

    console.log('📝 Intentando crear notificación:', params);
    
    // Crear la notificación en la base de datos
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

    // Si la notificación se creó exitosamente, intentar enviar por WhatsApp
    // Esto se hace en segundo plano, no bloquea si falla
    // Nota: Esta verificación debe hacerse en el servidor, por ahora solo logueamos
    // La integración real se hará desde el servidor cuando se creen las notificaciones
    (async () => {
      try {
        // Verificar si el usuario tiene WhatsApp habilitado
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('movil_verificado, whatsapp_notifications_enabled, phone')
          .eq('user_id', params.userId)
          .single();

        if (userProfile?.movil_verificado && userProfile?.whatsapp_notifications_enabled && userProfile?.phone) {
          // Construir mensaje para WhatsApp
          const whatsappMessage = `🔔 ${params.title}\n\n${params.message}`;
          
          // Llamar a la API route para enviar WhatsApp (desde el servidor)
          const whatsappResponse = await fetch('/api/whatsapp/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: params.userId,
              message: whatsappMessage,
            }),
          });

          if (whatsappResponse.ok) {
            console.log('✅ WhatsApp enviado exitosamente para notificación:', params.type);
          } else {
            const errorData = await whatsappResponse.json();
            console.warn('⚠️ Error enviando WhatsApp (no crítico):', errorData.error);
          }
        }
      } catch (whatsappError) {
        // No fallar la creación de notificación si WhatsApp falla
        console.warn('⚠️ Error enviando WhatsApp (no crítico):', whatsappError);
      }
    })();
    
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
    }
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

