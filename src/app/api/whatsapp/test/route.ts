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
 * API Route de prueba para enviar mensajes por WhatsApp usando Meta Cloud API
 * Permite probar el envío sin necesidad de un usuario en la base de datos
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, name, message } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'phoneNumber es requerido' },
        { status: 400 }
      );
    }

    const nameToUse = name || message || 'Usuario';

    const metaAccessToken = process.env.META_WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID;
    const apiVersion = process.env.META_WHATSAPP_API_VERSION || 'v21.0';

    if (!metaAccessToken) {
      return NextResponse.json(
        { error: 'META_WHATSAPP_ACCESS_TOKEN no está configurada' },
        { status: 500 }
      );
    }

    if (!phoneNumberId) {
      return NextResponse.json(
        { error: 'META_WHATSAPP_PHONE_NUMBER_ID no está configurada' },
        { status: 500 }
      );
    }

    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    const phoneForMeta = normalizedPhone.replace(/\+/g, '');

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
                text: nameToUse,
              },
            ],
          },
        ],
      },
    };

    const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

    console.log('📤 Enviando WhatsApp con Meta Cloud API...');
    console.log('URL:', url);
    console.log('To:', phoneForMeta);
    console.log('Template:', templateName);
    console.log('Language:', templateLanguage);
    console.log('Name (placeholder):', nameToUse);

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
      console.error('❌ Error enviando WhatsApp (Meta):', JSON.stringify(responseBody, null, 2));
      return NextResponse.json(
        {
          error: 'Error al enviar WhatsApp',
          details: responseBody,
          statusCode: response.status,
        },
        { status: 500 }
      );
    }

    console.log('✅ WhatsApp enviado exitosamente:', JSON.stringify(responseBody, null, 2));

    return NextResponse.json({
      success: true,
      message: 'WhatsApp enviado exitosamente via Meta Cloud API',
      data: responseBody,
      messageId: responseBody?.messages?.[0]?.id,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('❌ Error en test WhatsApp API:', error);
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        details: msg,
      },
      { status: 500 }
    );
  }
}
