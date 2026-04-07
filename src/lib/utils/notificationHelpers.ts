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
  'payment_processed',        // Recarga/carga completada
  'payment_released',         // Retiro completado o pago al trabajador (escrow)
  'payment_issue',            // Problema con un pago (rechazo, error)
  'client_rejected_application', // Cuando el cliente rechaza a un postulante → notificación al trabajador
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
    message: `¡Felicitaciones! Tu postulación ha sido aceptada para el servicio "${serviceTitle}"`,
    metadata: {
      booking_id: bookingId,
      service_title: serviceTitle,
      client_name: clientName,
      whatsapp_template: {
        name: 'seleccion_trabajador',
        parameters: ['{{name}}', serviceTitle],
      },
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
 * Crear notificación cuando hay un cambio en pagos:
 * - Recarga/carga completada (cliente)
 * - Retiro/descarga completada (trabajador)
 * - Pago al trabajador por escrow (sistema libera fondos)
 */
export const notifyPaymentProcessed = async (
  userId: string,
  amount: number,
  transactionId: string,
  isClient: boolean,
  /** 'retiro' = descarga procesada, 'escrow' = pago por servicio, 'debito' = débito al cliente por contratación */
  source?: 'retiro' | 'escrow' | 'debito'
) => {
  const formattedAmount = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(amount);

  let title: string;
  let message: string;
  if (isClient && source === 'debito') {
    title = 'Pago realizado';
    message = `Se debitaron ${formattedAmount} de tu cuenta para la contratación del servicio.`;
  } else if (isClient) {
    title = 'Recarga acreditada';
    message = `Tu recarga de ${formattedAmount} fue acreditada en tu cuenta.`;
  } else if (source === 'retiro') {
    title = 'Retiro procesado';
    message = `Tu retiro de ${formattedAmount} fue procesado y enviado.`;
  } else {
    title = 'Pago liberado';
    message = `Recibiste ${formattedAmount} por tu servicio.`;
  }

  // Determinar template de WhatsApp según el contexto del pago
  let whatsapp_template: { name: string; parameters: string[] };
  if (isClient && source === 'debito') {
    whatsapp_template = { name: 'debito_cliente', parameters: ['{{name}}', formattedAmount, 'contratación de servicio'] };
  } else if (isClient) {
    whatsapp_template = { name: 'recarga_aprobada', parameters: ['{{name}}', formattedAmount] };
  } else if (source === 'escrow') {
    whatsapp_template = { name: 'pago_completado', parameters: ['{{name}}', formattedAmount, 'servicio completado'] };
  } else {
    // retiro u otro
    whatsapp_template = { name: 'pago_completado', parameters: ['{{name}}', formattedAmount, 'retiro procesado'] };
  }

  return createNotification({
    userId,
    type: isClient ? 'payment_processed' : 'payment_released',
    title,
    message,
    metadata: {
      transaction_id: transactionId,
      amount,
      source: isClient ? 'recarga' : (source ?? 'escrow'),
      whatsapp_template,
    },
    isCritical: true
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
      transaction_id: transactionId,
      whatsapp_template: {
        name: 'problema_pago',
        parameters: ['{{name}}', errorMessage],
      },
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
 * Crear notificación cuando un cliente rechaza a un postulante (TRABAJADOR)
 */
export const notifyApplicationRejected = async (
  workerId: string,
  workerName: string,
  serviceTitle: string,
  serviceId: string
) => {
  return createNotification({
    userId: workerId,
    type: 'client_rejected_application',
    title: 'Actualización de postulación',
    message: `Tu postulación al servicio "${serviceTitle}" no fue seleccionada. Puedes ver otros servicios disponibles en tu app Hommy.`,
    metadata: {
      service_id: serviceId,
      service_title: serviceTitle,
      whatsapp_template: {
        name: 'postulacion_rechazada',
        parameters: ['{{name}}', serviceTitle],
      },
    },
    isCritical: true
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

