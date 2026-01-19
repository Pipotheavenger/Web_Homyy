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
 * Lista de tipos de notificaciones importantes que se envían por WhatsApp
 * Solo estas 4 notificaciones se enviarán por WhatsApp
 */
const IMPORTANT_NOTIFICATIONS_FOR_WHATSAPP: NotificationType[] = [
  'new_professional_applied',  // Cuando un trabajador postula a un servicio → notificación al usuario
  'client_selected_you',       // Cuando se selecciona al trabajador → notificación al trabajador
  'payment_processed',         // Cuando se paga y se confirma un pago
  'payment_released',          // Cuando se liberan los fondos al trabajador después de completar un servicio
];

/**
 * Verificar si una notificación es importante y debe enviarse por WhatsApp
 */
function isImportantNotificationForWhatsApp(type: NotificationType, isCritical?: boolean): boolean {
  // Si está marcada como crítica, siempre es importante
  if (isCritical) return true;
  
  // Verificar si está en la lista de notificaciones importantes
  return IMPORTANT_NOTIFICATIONS_FOR_WHATSAPP.includes(type);
}

/**
 * Crear una notificación para un usuario
 * Solo permite crear notificaciones vitales mínimas
 * También envía por WhatsApp si es una notificación importante y está habilitado
 */
export const createNotification = async (params: CreateNotificationParams) => {
  try {
    // Verificar que solo se creen notificaciones vitales
    if (!isImportantNotificationForWhatsApp(params.type, params.isCritical)) {
      console.log(`⚠️ Notificación ${params.type} no es vital, omitiendo...`);
      return { 
        success: true, 
        skipped: true,
        message: 'Solo se permiten notificaciones vitales mínimas' 
      };
    }

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
    
    // Crear la notificación usando la API route del servidor (bypass RLS)
    try {
      const apiResponse = await fetch('/api/notifications/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: params.userId,
          type: params.type,
          title: params.title,
          message: params.message,
          metadata: params.metadata || {},
          isCritical: params.isCritical || false
        }),
      });

      const result = await apiResponse.json();

      if (!apiResponse.ok) {
        console.error('❌ Error en API de notificaciones:', result.error);
        return { 
          success: false, 
          error: result.error || 'Error desconocido al crear notificación' 
        };
      }

      if (result.skipped) {
        return { 
          success: true, 
          skipped: true,
          message: result.message 
        };
      }

      return {
        success: true,
        data: result.data
      };
    } catch (fetchError) {
      console.error('❌ Error al llamar API de notificaciones:', fetchError);
      return { 
        success: false, 
        error: fetchError instanceof Error ? fetchError.message : 'Error al crear notificación' 
      };
    }
  } catch (error) {
    console.error('❌ Excepción al crear notificación:', error);
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Error desconocido al crear notificación';
    return { success: false, error: errorMessage };
  }
};

// Funciones de notificaciones no vitales eliminadas
// Solo se mantienen las notificaciones vitales mínimas

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

// Función de notificación de mensajes eliminada (no es vital)

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
 * Crear notificación cuando un cliente crea un servicio
 */
export const notifyServiceCreated = async (
  clientId: string,
  serviceTitle: string,
  serviceId: string
) => {
  return createNotification({
    userId: clientId,
    type: 'service_created',
    title: 'Servicio creado',
    message: `Tu servicio "${serviceTitle}" ha sido publicado exitosamente`,
    metadata: {
      service_id: serviceId,
      service_title: serviceTitle
    }
  });
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
 * Crear notificación cuando llega un nuevo mensaje (si la app no está abierta)
 */
export const notifyNewMessage = async (
  userId: string,
  senderName: string,
  chatId: string,
  messagePreview: string
) => {
  return createNotification({
    userId,
    type: 'new_message',
    title: 'Nuevo mensaje',
    message: `${senderName}: ${messagePreview.substring(0, 50)}${messagePreview.length > 50 ? '...' : ''}`,
    metadata: {
      chat_id: chatId,
      sender_name: senderName
    }
  });
};

