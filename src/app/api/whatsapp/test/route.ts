import { NextRequest, NextResponse } from 'next/server';

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
 * API Route de prueba para enviar mensajes por WhatsApp
 * Permite probar el envío sin necesidad de un usuario en la base de datos
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, message } = body;

    if (!phoneNumber || !message) {
      return NextResponse.json(
        { error: 'phoneNumber y message son requeridos' },
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
        { error: 'Configuración de WhatsApp no disponible: INFOBIP_API_KEY faltante' },
        { status: 500 }
      );
    }

    if (!infobipWhatsAppSender) {
      console.error('INFOBIP_WHATSAPP_SENDER_ID no está configurada');
      return NextResponse.json(
        { error: 'Sender ID de WhatsApp no configurado: INFOBIP_WHATSAPP_SENDER_ID faltante' },
        { status: 500 }
      );
    }

    // Normalizar y limpiar el número de teléfono
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    const phoneForInfobip = normalizedPhone.replace(/\+/g, '');

    // Asegurar que la URL tenga el protocolo https://
    let baseUrl = infobipBaseUrl;
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      baseUrl = `https://${baseUrl}`;
    }

    // Usar template "notificacion" (forzar "notificacion" en lugar de usar variable de entorno)
    const templateName = 'notificacion';
    // El template requiere "es_CO" (español Colombia), no solo "es"
    let templateLanguage = process.env.INFOBIP_WHATSAPP_TEMPLATE_LANGUAGE || 'es_CO';
    if (templateLanguage === 'es') {
      templateLanguage = 'es_CO'; // Forzar es_CO si está configurado como "es"
    }
    
    // Usar el mensaje proporcionado, o string vacío si no se proporciona
    // Si el template no tiene placeholders, deberíamos enviar array vacío
    const messageToSend = message || '';
    
    console.log('📤 Enviando WhatsApp con template de texto...');
    const endpoint = `${baseUrl}/whatsapp/1/message/template`;
    
    // Template "notificacion" - según el JSON proporcionado, solo tiene body con placeholders
    // NO incluye header en templateData
    const payload = {
      messages: [
        {
          from: infobipWhatsAppSender,
          to: phoneForInfobip,
          content: {
            templateName: templateName,
            templateData: {
              body: {
                placeholders: messageToSend ? [messageToSend] : [] // Array con placeholders o vacío
              }
            },
            language: templateLanguage
          }
        }
      ]
    };

    console.log('URL:', endpoint);
    console.log('To:', phoneForInfobip);
    console.log('From:', infobipWhatsAppSender);
    console.log('Template:', templateName);
    console.log('Language:', templateLanguage);
    console.log('Message:', messageToSend);
    console.log('Payload completo:', JSON.stringify(payload, null, 2));

    const response = await fetch(endpoint, {
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
      console.error('❌ Error enviando WhatsApp con template:');
      console.error('Status:', response.status);
      console.error('Error Data:', JSON.stringify(errorData, null, 2));
      
      
      return NextResponse.json(
        { 
          error: 'Error al enviar WhatsApp con template',
          details: errorData,
          statusCode: response.status,
          endpoint: endpoint,
          templateName: templateName,
          suggestion: 'Verifica: 1) Que el template esté aprobado y activo en WhatsApp, 2) Que el formato del payload sea correcto, 3) Que el número de destino sea válido y tenga WhatsApp activo'
        },
        { status: 500 }
      );
    }

    const result = await response.json();
    console.log('✅ WhatsApp enviado exitosamente:', JSON.stringify(result, null, 2));
    
    // Retornar también el payload enviado para debugging
    return NextResponse.json({
      success: true,
      message: 'WhatsApp enviado exitosamente',
      data: result,
      payloadSent: payload, // Incluir el payload enviado para verificación
      messageId: result.messages?.[0]?.messageId
    });
  } catch (error: any) {
    console.error('❌ Error en test WhatsApp API:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

