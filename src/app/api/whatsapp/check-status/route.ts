import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route para verificar el estado de un mensaje de WhatsApp
 * Permite consultar el estado de entrega de un mensaje enviado
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const messageId = searchParams.get('messageId');

    if (!messageId) {
      return NextResponse.json(
        { error: 'messageId es requerido' },
        { status: 400 }
      );
    }

    // Obtener las credenciales de Infobip
    const infobipApiKey = process.env.INFOBIP_API_KEY;
    const infobipBaseUrl = process.env.INFOBIP_BASE_URL || 'https://api.infobip.com';

    if (!infobipApiKey) {
      return NextResponse.json(
        { error: 'INFOBIP_API_KEY no está configurada' },
        { status: 500 }
      );
    }

    // Asegurar que la URL tenga el protocolo https://
    let baseUrl = infobipBaseUrl;
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      baseUrl = `https://${baseUrl}`;
    }

    // Consultar el estado del mensaje
    const response = await fetch(`${baseUrl}/whatsapp/1/reports?messageId=${messageId}`, {
      method: 'GET',
      headers: {
        'Authorization': `App ${infobipApiKey}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = await response.text();
      }
      return NextResponse.json(
        { 
          error: 'Error al consultar el estado del mensaje',
          details: errorData
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('❌ Error en check-status WhatsApp API:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error.message 
      },
      { status: 500 }
    );
  }
}


