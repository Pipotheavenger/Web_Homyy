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

    // Crear cliente de Supabase con service_role para bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    if (!supabaseServiceKey) {
      console.error('SUPABASE_SERVICE_ROLE_KEY no está configurada');
      return NextResponse.json(
        { error: 'Configuración de servidor no disponible' },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Obtener información del usuario (incluyendo nombre y teléfono)
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('phone, whatsapp_notifications_enabled, name')
      .eq('user_id', userId)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
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

    // Obtener el nombre del usuario para personalizar el mensaje
    const userName = userProfile.name || 'Usuario';
    
    // Normalizar y limpiar el número de teléfono
    const normalizedPhone = normalizePhoneNumber(userProfile.phone);
    const phoneForInfobip = normalizedPhone.replace(/\+/g, '');

    // Validar que tenemos los datos necesarios
    if (!phoneForInfobip) {
      return NextResponse.json(
        { error: 'Número de teléfono no válido' },
        { status: 400 }
      );
    }

    console.log('📱 Datos del usuario para WhatsApp:');
    console.log('  - User ID:', userId);
    console.log('  - Nombre:', userName);
    console.log('  - Teléfono original:', userProfile.phone);
    console.log('  - Teléfono normalizado:', normalizedPhone);
    console.log('  - Teléfono para Infobip:', phoneForInfobip);

    // Asegurar que la URL tenga el protocolo https://
    let baseUrl = infobipBaseUrl;
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      baseUrl = `https://${baseUrl}`;
    }

    // WhatsApp requiere usar templates para mensajes fuera de la ventana de 24 horas
    // IMPORTANTE: Necesitas crear un template en Infobip con placeholders para el mensaje
    // Ejemplo de template: "Notificación Hommy: {{1}}"
    
    // Usar template "notificacion" (forzar "notificacion" en lugar de usar variable de entorno)
    const templateName = 'notificacion';
    // El template requiere "es_CO" (español Colombia), no solo "es"
    let templateLanguage = process.env.INFOBIP_WHATSAPP_TEMPLATE_LANGUAGE || 'es_CO';
    if (templateLanguage === 'es') {
      templateLanguage = 'es_CO'; // Forzar es_CO si está configurado como "es"
    }
    
    // Template "notificacion": "Hola {{1}}, Tu solicitud en Hommy tiene una nueva actualización. – Hommy"
    // El placeholder {{1}} es el nombre del usuario
    // El mensaje personalizado se incluye en el placeholder
    const payload = {
      messages: [
        {
          from: infobipWhatsAppSender,
          to: phoneForInfobip,
          content: {
            templateName: templateName,
            templateData: {
              body: {
                placeholders: [userName] // Nombre del usuario como placeholder {{1}}
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

