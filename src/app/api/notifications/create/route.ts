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

    // Verificar si el tipo de notificación está habilitado (y si WhatsApp está habilitado para este tipo)
    // Nota: whatsapp_enabled puede no existir si no se aplicó el SQL; en ese caso hacemos fallback.
    let setting: { enabled?: boolean; whatsapp_enabled?: boolean } | null = null;
    {
      const attempt = await supabaseAdmin
        .from('notification_settings')
        .select('enabled, whatsapp_enabled')
        .eq('notification_type', type)
        .single();

      if (!attempt.error) {
        setting = attempt.data as any;
      } else {
        const msg = String(attempt.error.message || '');
        const columnMissing = msg.toLowerCase().includes('whatsapp_enabled'.toLowerCase());
        if (columnMissing) {
          const fallback = await supabaseAdmin
            .from('notification_settings')
            .select('enabled')
            .eq('notification_type', type)
            .single();
          if (!fallback.error) {
            setting = fallback.data as any;
          } else {
            // Si falla, no bloqueamos la notificación; seguimos con comportamiento por defecto.
            console.warn('⚠️ No se pudo leer notification_settings (fallback):', fallback.error);
            setting = null;
          }
        } else {
          console.warn('⚠️ No se pudo leer notification_settings:', attempt.error);
          setting = null;
        }
      }
    }

    // Si la configuración existe y está deshabilitada, no crear la notificación
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

    // Enviar WhatsApp si es una notificación importante (solo las 4 configuradas)
    const importantTypes: NotificationType[] = [
      'new_professional_applied',  // Cuando un trabajador postula a un servicio
      'client_selected_you',       // Cuando se selecciona al trabajador
      'payment_processed',         // Cuando se paga y se confirma un pago
      'payment_released',          // Cuando se liberan los fondos al trabajador después de completar un servicio
    ];

    // Solo enviar WhatsApp si:
    // 1. Es un tipo importante (una de las 4 notificaciones vitales)
    // 2. La notificación está habilitada en notification_settings (si existe la configuración)
    const isNotificationEnabled = !setting || setting.enabled !== false;
    const isWhatsAppEnabledForType = !setting || setting.whatsapp_enabled !== false; // default ON si no existe
    const shouldSendWhatsApp = importantTypes.includes(type) && isNotificationEnabled && isWhatsAppEnabledForType;

    if (shouldSendWhatsApp) {
      // Verificar si el usuario tiene WhatsApp habilitado: primero user_profiles, luego worker_profiles
      const { data: userProfile } = await supabaseAdmin
        .from('user_profiles')
        .select('whatsapp_notifications_enabled, phone, name')
        .eq('user_id', userId)
        .single();

      const canSendFromUser = userProfile?.whatsapp_notifications_enabled && userProfile?.phone;

      let canSendWhatsApp = canSendFromUser;
      if (!canSendFromUser) {
        const { data: workerProfile } = await supabaseAdmin
          .from('worker_profiles')
          .select('whatsapp_notifications_enabled, phone, name')
          .eq('user_id', userId)
          .single();
        canSendWhatsApp = !!(workerProfile?.whatsapp_notifications_enabled && workerProfile?.phone);
      }

      if (canSendWhatsApp) {
        // Enviar WhatsApp en segundo plano (no bloquea la respuesta)
        // El template "notificacion" usa el nombre del usuario como placeholder {{1}}
        // Template: "Hola {{1}}, Tu solicitud en Hommy tiene una nueva actualización. – Hommy"
        // El endpoint /api/whatsapp/send obtendrá el nombre y número desde user_profiles o worker_profiles
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
          (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

        console.log(`📱 Enviando WhatsApp para notificación ${type} al usuario ${userId}`);
        
        fetch(`${baseUrl}/api/whatsapp/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userId,
            message: message,
            title: title,
            type: type,
          }),
        })
        .then(async (response) => {
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
            console.error(`❌ Error enviando WhatsApp:`, errorData);
          } else {
            console.log(`✅ WhatsApp enviado exitosamente para usuario ${userId}`);
          }
        })
        .catch(err => {
          console.warn('⚠️ Error enviando WhatsApp (no crítico):', err);
        });
      } else {
        console.log(`ℹ️ WhatsApp no enviado para usuario ${userId}: notificaciones deshabilitadas o sin teléfono`);
      }
    } else {
      console.log(`ℹ️ WhatsApp no enviado: tipo ${type} no es importante o notificación deshabilitada`);
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

