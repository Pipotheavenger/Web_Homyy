/**
 * Servicio para enviar mensajes por WhatsApp usando Infobip
 */

// Función para normalizar el número de teléfono
function normalizePhoneNumber(phone: string): string {
  if (!phone) return '';
  
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  if (!cleaned.startsWith('+')) {
    if (cleaned.length === 10) {
      cleaned = '+57' + cleaned;
    } else {
      cleaned = '+57' + cleaned.replace(/^57/, '');
    }
  }
  
  return cleaned;
}

/**
 * Enviar un mensaje de WhatsApp usando Infobip
 * @param phoneNumber Número de teléfono del destinatario (con o sin formato)
 * @param message Mensaje a enviar
 * @returns Promise con el resultado del envío
 */
export async function sendWhatsAppMessage(
  phoneNumber: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const infobipApiKey = process.env.INFOBIP_API_KEY;
    const infobipBaseUrl = process.env.INFOBIP_BASE_URL || 'https://api.infobip.com';
    const infobipWhatsAppSender = process.env.INFOBIP_WHATSAPP_SENDER_ID;

    if (!infobipApiKey) {
      console.error('INFOBIP_API_KEY no está configurada');
      return { success: false, error: 'Configuración de WhatsApp no disponible' };
    }

    if (!infobipWhatsAppSender) {
      console.error('INFOBIP_WHATSAPP_SENDER_ID no está configurada');
      return { success: false, error: 'Sender ID de WhatsApp no configurado' };
    }

    // Normalizar y limpiar el número de teléfono
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    const phoneForInfobip = normalizedPhone.replace(/\+/g, '');

    // Asegurar que la URL tenga el protocolo https://
    let baseUrl = infobipBaseUrl;
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      baseUrl = `https://${baseUrl}`;
    }

    // Usar el endpoint de WhatsApp de Infobip
    // Para mensajes de texto simples, usamos el endpoint de texto
    // Nota: Para usar templates, necesitarías usar /whatsapp/1/message/template
    const payload = {
      messages: [
        {
          destinations: [{ to: phoneForInfobip }],
          from: infobipWhatsAppSender,
          text: message,
        },
      ],
    };

    const response = await fetch(`${baseUrl}/whatsapp/1/message/text`, {
      method: 'POST',
      headers: {
        'Authorization': `App ${infobipApiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = await response.text();
      }
      console.error('❌ Error enviando WhatsApp:', errorData);
      return { 
        success: false, 
        error: errorData?.message || `Error ${response.status}: ${response.statusText}` 
      };
    }

    const result = await response.json();
    console.log('✅ WhatsApp enviado exitosamente:', result);
    return { success: true };
  } catch (error: any) {
    console.error('❌ Error en sendWhatsAppMessage:', error);
    return { 
      success: false, 
      error: error.message || 'Error desconocido al enviar WhatsApp' 
    };
  }
}

/**
 * Verificar si un usuario tiene WhatsApp habilitado
 * @param userId ID del usuario
 * @returns Promise con el estado de WhatsApp habilitado
 */
export async function isWhatsAppEnabled(userId: string): Promise<boolean> {
  try {
    const { supabase } = await import('@/lib/supabase');
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('movil_verificado, whatsapp_notifications_enabled')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      console.error('Error verificando estado de WhatsApp:', error);
      return false;
    }

    // Solo está habilitado si el móvil está verificado Y las notificaciones están habilitadas
    return data.movil_verificado === true && data.whatsapp_notifications_enabled === true;
  } catch (error) {
    console.error('Error en isWhatsAppEnabled:', error);
    return false;
  }
}

/**
 * Obtener el número de teléfono de un usuario
 * @param userId ID del usuario
 * @returns Promise con el número de teléfono o null
 */
export async function getUserPhoneNumber(userId: string): Promise<string | null> {
  try {
    const { supabase } = await import('@/lib/supabase');
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('phone')
      .eq('user_id', userId)
      .single();

    if (error || !data || !data.phone) {
      return null;
    }

    return data.phone;
  } catch (error) {
    console.error('Error obteniendo número de teléfono:', error);
    return null;
  }
}
