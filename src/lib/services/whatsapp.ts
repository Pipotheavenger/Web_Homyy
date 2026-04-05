/**
 * Servicio para enviar mensajes por WhatsApp usando Meta Cloud API
 * Migrado desde Infobip para evitar bloqueos por spam detection del intermediario
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
 * Envía un mensaje de WhatsApp usando el template "notificacion" de Meta Cloud API.
 * Obtiene teléfono y nombre desde user_profiles o worker_profiles (Supabase admin).
 * Usar desde API routes o server-side; evita llamadas HTTP internas (401 en Vercel).
 */
export async function sendWhatsAppTemplateToUser(
  userId: string,
  message: string,
  options?: { title?: string; type?: string }
): Promise<{ success: boolean; error?: string; messageId?: string }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const metaAccessToken = process.env.META_WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID;
  const apiVersion = process.env.META_WHATSAPP_API_VERSION || 'v21.0';

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('SUPABASE no configurado para sendWhatsAppTemplateToUser');
    return { success: false, error: 'Configuración de servidor no disponible' };
  }
  if (!metaAccessToken) {
    console.error('META_WHATSAPP_ACCESS_TOKEN no está configurada');
    return { success: false, error: 'Configuración de WhatsApp no disponible' };
  }
  if (!phoneNumberId) {
    console.error('META_WHATSAPP_PHONE_NUMBER_ID no está configurada');
    return { success: false, error: 'Phone Number ID de WhatsApp no configurado' };
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
  // Meta Cloud API requiere el número sin el '+' inicial
  const phoneForMeta = normalizedPhone.replace(/\+/g, '');
  if (!phoneForMeta) {
    return { success: false, error: 'Número de teléfono no válido' };
  }

  const templateName = process.env.META_WHATSAPP_TEMPLATE_NAME || 'notificacion';
  const templateLanguage = process.env.META_WHATSAPP_TEMPLATE_LANGUAGE || 'es_CO';

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: phoneForMeta,
    type: 'template',
    template: {
      name: templateName,
      language: {
        code: templateLanguage,
      },
      components: [
        {
          type: 'body',
          parameters: [
            {
              type: 'text',
              text: userName,
            },
          ],
        },
      ],
    },
  };

  const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

  console.log('[whatsapp] before meta | template:', templateName, '| to:', phoneForMeta);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${metaAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseBody = await response.json();
    console.log('[whatsapp] after meta | status:', response.status, '| response:', JSON.stringify(responseBody).slice(0, 300));

    if (!response.ok) {
      console.error('❌ Error enviando WhatsApp (Meta):', responseBody);
      const errorMessage = responseBody?.error?.message || `Error ${response.status}`;
      return { success: false, error: errorMessage };
    }

    const messageId = responseBody?.messages?.[0]?.id || '';
    console.log('✅ WhatsApp enviado exitosamente para usuario', userId, '| messageId:', messageId);
    return { success: true, messageId };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('❌ Error en sendWhatsAppTemplateToUser:', err);
    return { success: false, error: msg };
  }
}

/**
 * Enviar un mensaje de WhatsApp de texto libre usando Meta Cloud API
 * @param phoneNumber Número de teléfono del destinatario (con o sin formato)
 * @param message Mensaje a enviar
 * @returns Promise con el resultado del envío
 */
export async function sendWhatsAppMessage(
  phoneNumber: string,
  message: string
): Promise<{ success: boolean; error?: string; messageId?: string }> {
  try {
    const metaAccessToken = process.env.META_WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID;
    const apiVersion = process.env.META_WHATSAPP_API_VERSION || 'v21.0';

    if (!metaAccessToken) {
      console.error('META_WHATSAPP_ACCESS_TOKEN no está configurada');
      return { success: false, error: 'Configuración de WhatsApp no disponible' };
    }

    if (!phoneNumberId) {
      console.error('META_WHATSAPP_PHONE_NUMBER_ID no está configurada');
      return { success: false, error: 'Phone Number ID de WhatsApp no configurado' };
    }

    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    const phoneForMeta = normalizedPhone.replace(/\+/g, '');

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: phoneForMeta,
      type: 'text',
      text: {
        preview_url: false,
        body: message,
      },
    };

    const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${metaAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseBody = await response.json();

    if (!response.ok) {
      console.error('❌ Error enviando WhatsApp (Meta):', responseBody);
      return {
        success: false,
        error: responseBody?.error?.message || `Error ${response.status}: ${response.statusText}`,
      };
    }

    const messageId = responseBody?.messages?.[0]?.id || '';
    console.log('✅ WhatsApp enviado exitosamente:', messageId);
    return { success: true, messageId };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('❌ Error en sendWhatsAppMessage:', error);
    return { success: false, error: msg };
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
