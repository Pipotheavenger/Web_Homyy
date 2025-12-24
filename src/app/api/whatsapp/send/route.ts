import { NextRequest, NextResponse } from 'next/server';
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
 * API Route para enviar mensajes por WhatsApp usando Infobip
 * Se llama desde el servidor cuando se crean notificaciones
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, message } = body;

    if (!userId || !message) {
      return NextResponse.json(
        { error: 'userId y message son requeridos' },
        { status: 400 }
      );
    }

    // Obtener las credenciales de Infobip desde variables de entorno
    const infobipApiKey = process.env.INFOBIP_API_KEY;
    const infobipBaseUrl = process.env.INFOBIP_BASE_URL || 'https://api.infobip.com';
    const infobipWhatsAppSender = process.env.INFOBIP_WHATSAPP_SENDER_ID;

    if (!infobipApiKey) {
      console.error('INFOBIP_API_KEY no está configurada');
      return NextResponse.json(
        { error: 'Configuración de WhatsApp no disponible' },
        { status: 500 }
      );
    }

    if (!infobipWhatsAppSender) {
      console.error('INFOBIP_WHATSAPP_SENDER_ID no está configurada');
      return NextResponse.json(
        { error: 'Sender ID de WhatsApp no configurado' },
        { status: 500 }
      );
    }

    // Crear cliente de Supabase
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Obtener información del usuario
    const { data: userProfile, error: profileError } = await supabaseClient
      .from('user_profiles')
      .select('phone, movil_verificado, whatsapp_notifications_enabled')
      .eq('user_id', userId)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que el móvil esté verificado y WhatsApp esté habilitado
    if (!userProfile.movil_verificado) {
      return NextResponse.json(
        { error: 'Móvil no verificado' },
        { status: 400 }
      );
    }

    if (!userProfile.whatsapp_notifications_enabled) {
      return NextResponse.json(
        { error: 'Notificaciones WhatsApp deshabilitadas' },
        { status: 400 }
      );
    }

    if (!userProfile.phone) {
      return NextResponse.json(
        { error: 'Usuario no tiene número de teléfono' },
        { status: 400 }
      );
    }

    // Normalizar y limpiar el número de teléfono
    const normalizedPhone = normalizePhoneNumber(userProfile.phone);
    const phoneForInfobip = normalizedPhone.replace(/\+/g, '');

    // Asegurar que la URL tenga el protocolo https://
    let baseUrl = infobipBaseUrl;
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      baseUrl = `https://${baseUrl}`;
    }

    // WhatsApp requiere usar templates para mensajes fuera de la ventana de 24 horas
    // IMPORTANTE: Necesitas crear un template en Infobip con placeholders para el mensaje
    // Ejemplo de template: "Notificación Hommy: {{1}}"
    
    const templateName = process.env.INFOBIP_WHATSAPP_TEMPLATE_NAME || 'notification_template';
    const templateLanguage = process.env.INFOBIP_WHATSAPP_TEMPLATE_LANGUAGE || 'es';
    
    // Para el template, enviamos el mensaje completo como un solo placeholder
    // Ajusta según la estructura de tu template en Infobip
    const payload = {
      messages: [
        {
          from: infobipWhatsAppSender,
          to: phoneForInfobip,
          content: {
            templateName: templateName,
            templateData: {
              body: {
                placeholders: [message] // Template debe tener {{1}} para el mensaje
              }
            },
            language: templateLanguage
          }
        }
      ]
    };

    console.log('📤 Enviando WhatsApp a Infobip:');
    console.log('URL:', `${baseUrl}/whatsapp/1/message/template`);
    console.log('To:', phoneForInfobip);
    console.log('Template:', templateName);
    console.log('Payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(`${baseUrl}/whatsapp/1/message/template`, {
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
      return NextResponse.json(
        { 
          error: 'Error al enviar WhatsApp',
          details: errorData 
        },
        { status: 500 }
      );
    }

    const result = await response.json();
    console.log('✅ WhatsApp enviado exitosamente:', result);

    return NextResponse.json({
      success: true,
      message: 'WhatsApp enviado exitosamente',
    });
  } catch (error: any) {
    console.error('❌ Error en send WhatsApp API:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
