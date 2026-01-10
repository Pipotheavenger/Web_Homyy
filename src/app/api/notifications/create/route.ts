import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { NotificationType } from '@/lib/api/notifications';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Cliente con service_role para bypass RLS
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type, title, message, metadata, isCritical } = body;

    // Validar campos requeridos
    if (!userId || !type || !title || !message) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: userId, type, title, message' },
        { status: 400 }
      );
    }

    // Validar tipo de notificación
    const validTypes: NotificationType[] = [
      'payment_processed',
      'payment_released',
      'payment_issue',
      'service_created',
      'new_professional_applied',
      'client_selected_you',
      'service_cancelled',
      'service_completed',
      'new_message',
    ];

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Tipo de notificación inválido: ${type}` },
        { status: 400 }
      );
    }

    // Verificar si el tipo de notificación está habilitado
    const { data: setting } = await supabaseAdmin
      .from('notification_settings')
      .select('enabled')
      .eq('notification_type', type)
      .single();

    if (setting && !setting.enabled) {
      return NextResponse.json(
        { 
          success: true, 
          skipped: true,
          message: 'Notificación deshabilitada por configuración' 
        },
        { status: 200 }
      );
    }

    // Crear la notificación usando service_role (bypass RLS)
    const { data: notification, error } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: userId,
        type: type as NotificationType,
        title,
        message,
        metadata: metadata || {},
        is_critical: isCritical || false
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error al crear notificación:', error);
      return NextResponse.json(
        { error: error.message || 'Error al crear notificación' },
        { status: 500 }
      );
    }

    // Enviar WhatsApp si es una notificación importante
    const importantTypes: NotificationType[] = [
      'payment_processed',
      'payment_released',
      'payment_issue',
      'service_created',
      'new_professional_applied',
      'client_selected_you',
      'service_cancelled',
      'service_completed',
      'new_message',
    ];

    if (importantTypes.includes(type) && (isCritical || true)) {
      // Verificar si el usuario tiene WhatsApp habilitado y obtener datos del usuario
      const { data: userProfile } = await supabaseAdmin
        .from('user_profiles')
        .select('whatsapp_notifications_enabled, phone, name')
        .eq('user_id', userId)
        .single();

      if (userProfile?.whatsapp_notifications_enabled && userProfile?.phone) {
        // Enviar WhatsApp en segundo plano (no bloquea la respuesta)
        // El template "notificacion" usa el nombre del usuario como placeholder {{1}}
        // Template: "Hola {{1}}, Tu solicitud en Hommy tiene una nueva actualización. – Hommy"
        // El endpoint /api/whatsapp/send obtendrá el nombre y número del usuario automáticamente
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
          (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
        
        fetch(`${baseUrl}/api/whatsapp/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userId,
            message: message, // El mensaje de la notificación (aunque el template solo usa el nombre)
          }),
        }).catch(err => {
          console.warn('⚠️ Error enviando WhatsApp (no crítico):', err);
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('❌ Error en API de notificaciones:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}

