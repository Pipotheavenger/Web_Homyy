import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppTemplateToUser } from '@/lib/services/whatsapp';

/**
 * API Route para enviar mensajes por WhatsApp usando Infobip.
 * Usa la función compartida sendWhatsAppTemplateToUser (sin llamada HTTP interna).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, message, title, type } = body;

    if (!userId || !message) {
      return NextResponse.json(
        { error: 'userId y message son requeridos' },
        { status: 400 }
      );
    }

    const result = await sendWhatsAppTemplateToUser(userId, message, { title, type });

    if (!result.success) {
      const status =
        result.error?.includes('no encontrado') || result.error?.includes('sin número')
          ? 404
          : result.error?.includes('deshabilitadas')
            ? 400
            : 500;
      return NextResponse.json(
        { error: result.error || 'Error al enviar WhatsApp' },
        { status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'WhatsApp enviado exitosamente',
    });
  } catch (error: unknown) {
    console.error('❌ Error en send WhatsApp API:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

