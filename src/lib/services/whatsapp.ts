/**
 * Servicio para enviar mensajes por WhatsApp usando Infobip
 */

import { createClient } from '@supabase/supabase-js';

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
 * Envía un mensaje de WhatsApp usando el template "notificacion" de Infobip.
 * Obtiene teléfono y nombre desde user_profiles o worker_profiles (Supabase admin).
 * Usar desde API routes o server-side; evita llamadas HTTP internas (401 en Vercel).
 */
export async function sendWhatsAppTemplateToUser(
  userId: string,
  message: string,
  options?: { title?: string; type?: string }
): Promise<{ success: boolean; error?: string }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const infobipApiKey = process.env.INFOBIP_API_KEY;
  const infobipBaseUrl = process.env.INFOBIP_BASE_URL || 'https://api.infobip.com';
  const infobipWhatsAppSender = process.env.INFOBIP_WHATSAPP_SENDER_ID;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('SUPABASE no configurado para sendWhatsAppTemplateToUser');
    return { success: false, error: 'Configuración de servidor no disponible' };
  }
  if (!infobipApiKey) {
    console.error('INFOBIP_API_KEY no está configurada');
    return { success: false, error: 'Configuración de WhatsApp no disponible' };
  }
  if (!infobipWhatsAppSender) {
    console.error('INFOBIP_WHATSAPP_SENDER_ID no está configurada');
    return { success: false, error: 'Sender ID de WhatsApp no configurado' };
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Determinar la tabla correcta según el tipo de notificación
  const workerNotificationTypes = ['payment_released', 'client_selected_you'];
  const clientNotificationTypes = ['payment_processed', 'new_professional_applied'];
  const notificationType = options?.type || '';

  let profile: { phone: string; name: string | null } | null = null;
  let whatsappEnabled = false;

  if (workerNotificationTypes.includes(notificationType)) {
    // Notificación para trabajador → whatsapp_enabled de worker_profiles, phone/name de user_profiles
    const [workerResult, userResult] = await Promise.all([
      supabaseAdmin.from('worker_profiles').select('whatsapp_notifications_enabled').eq('user_id', userId).single(),
      supabaseAdmin.from('user_profiles').select('phone, name').eq('user_id', userId).single(),
    ]);

    if (workerResult.data?.whatsapp_notifications_enabled && userResult.data?.phone) {
      profile = { phone: userResult.data.phone, name: userResult.data.name || null };
      whatsappEnabled = true;
    }
  } else if (clientNotificationTypes.includes(notificationType)) {
    // Notificación para cliente → buscar solo en user_profiles
    const { data: userProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('phone, whatsapp_notifications_enabled, name')
      .eq('user_id', userId)
      .single();

    if (userProfile?.whatsapp_notifications_enabled && userProfile?.phone) {
      profile = { phone: userProfile.phone, name: userProfile.name || null };
      whatsappEnabled = true;
    }
  } else {
    // Tipo desconocido o payment_issue → buscar primero en worker_profiles, luego user_profiles
    const { data: userProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('phone, name, whatsapp_notifications_enabled')
      .eq('user_id', userId)
      .single();

    const { data: workerProfile } = await supabaseAdmin
      .from('worker_profiles')
      .select('whatsapp_notifications_enabled')
      .eq('user_id', userId)
      .single();

    // Si es worker y tiene whatsapp habilitado en worker_profiles
    if (workerProfile?.whatsapp_notifications_enabled && userProfile?.phone) {
      profile = { phone: userProfile.phone, name: userProfile.name || null };
      whatsappEnabled = true;
    } else if (userProfile?.whatsapp_notifications_enabled && userProfile?.phone) {
      // Si es cliente con whatsapp habilitado en user_profiles
      profile = { phone: userProfile.phone, name: userProfile.name || null };
      whatsappEnabled = true;
    }
  }

  if (!profile || !profile.phone) {
    return { success: false, error: 'Usuario no encontrado o sin número de teléfono' };
  }
  if (!whatsappEnabled) {
    return { success: false, error: 'Notificaciones WhatsApp deshabilitadas' };
  }

  const userName = profile.name || 'Usuario';
  const normalizedPhone = normalizePhoneNumber(profile.phone);
  const phoneForInfobip = normalizedPhone.replace(/\+/g, '');
  if (!phoneForInfobip) {
    return { success: false, error: 'Número de teléfono no válido' };
  }

  let baseUrl = infobipBaseUrl;
  if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
    baseUrl = `https://${baseUrl}`;
  }

  const templateName = 'notificacion';
  let templateLanguage = process.env.INFOBIP_WHATSAPP_TEMPLATE_LANGUAGE || 'es_CO';
  if (templateLanguage === 'es') templateLanguage = 'es_CO';

  const payload = {
    messages: [
      {
        from: infobipWhatsAppSender,
        to: phoneForInfobip,
        content: {
          templateName,
          templateData: {
            body: { placeholders: [userName] },
          },
          language: templateLanguage,
        },
      },
    ],
  };

  console.log('[whatsapp] before infobip | template:', templateName, '| to:', phoneForInfobip);
  try {
    const response = await fetch(`${baseUrl}/whatsapp/1/message/template`, {
      method: 'POST',
      headers: {
        Authorization: `App ${infobipApiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseBodyRaw = await response.text();
    const bodyPreview = responseBodyRaw.slice(0, 300);
    console.log('[whatsapp] after infobip | status:', response.status, '| bodyPreview:', bodyPreview);

    if (!response.ok) {
      let errorData: unknown;
      try {
        errorData = JSON.parse(responseBodyRaw);
      } catch {
        errorData = responseBodyRaw;
      }
      console.error('❌ Error enviando WhatsApp:', errorData);
      return {
        success: false,
        error: typeof errorData === 'object' && errorData !== null && 'message' in errorData
          ? String((errorData as { message: string }).message)
          : `Error ${response.status}`,
      };
    }
    console.log('✅ WhatsApp enviado exitosamente para usuario', userId);
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('❌ Error en sendWhatsAppTemplateToUser:', err);
    return { success: false, error: msg };
  }
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


