import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route para verificar el estado de un mensaje de WhatsApp
 * Usa Meta Cloud API (Graph API) para consultar el estado
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

    const metaAccessToken = process.env.META_WHATSAPP_ACCESS_TOKEN;
    const apiVersion = process.env.META_WHATSAPP_API_VERSION || 'v21.0';

    if (!metaAccessToken) {
      return NextResponse.json(
        { error: 'META_WHATSAPP_ACCESS_TOKEN no está configurada' },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://graph.facebook.com/${apiVersion}/${messageId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${metaAccessToken}`,
          Accept: 'application/json',
        },
      }
    );

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
          details: errorData,
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('❌ Error en check-status WhatsApp API:', error);
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        details: msg,
      },
      { status: 500 }
    );
  }
}
