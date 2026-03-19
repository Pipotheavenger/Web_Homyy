import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { NotificationType } from '@/lib/api/notifications';
import { sendWhatsAppTemplateToUser } from '@/lib/services/whatsapp';

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

    // Enviar WhatsApp si es una notificación importante (pagos y eventos vitales)
    const importantTypes: NotificationType[] = [
      'new_professional_applied',  // Cuando un trabajador postula a un servicio
      'client_selected_you',       // Cuando se selecciona al trabajador
      'payment_processed',        // Recarga/carga completada → acreditación en cuenta
      'payment_released',          // Retiro completado o pago al trabajador (escrow)
      'payment_issue',             // Problema con un pago (rechazo, error)
    ];

    // Solo enviar WhatsApp si:
    // 1. Es un tipo importante (una de las 4 notificaciones vitales)
    // 2. La notificación está habilitada en notification_settings (si existe la configuración)
    // 3. WhatsApp está habilitado para este tipo de notificación (whatsapp_enabled)
    const isNotificationEnabled = !setting || setting.enabled;
    const isWhatsAppEnabled = !setting || setting.whatsapp_enabled !== false;
    const shouldSendWhatsApp = importantTypes.includes(type) && isNotificationEnabled && isWhatsAppEnabled;

    if (shouldSendWhatsApp) {
      // Determinar la tabla correcta según el tipo de notificación
      const workerNotificationTypes: NotificationType[] = ['payment_released', 'client_selected_you'];
      const clientNotificationTypes: NotificationType[] = ['payment_processed', 'new_professional_applied'];

      let canSendWhatsApp = false;

      if (workerNotificationTypes.includes(type)) {
        // Notificación para trabajador → whatsapp_enabled de worker_profiles, phone de user_profiles
        const [workerResult, userResult] = await Promise.all([
          supabaseAdmin.from('worker_profiles').select('whatsapp_notifications_enabled').eq('user_id', userId).single(),
          supabaseAdmin.from('user_profiles').select('phone').eq('user_id', userId).single(),
        ]);
        canSendWhatsApp = !!(workerResult.data?.whatsapp_notifications_enabled && userResult.data?.phone);
      } else if (clientNotificationTypes.includes(type)) {
        // Notificación para cliente → buscar solo en user_profiles
        const { data: userProfile } = await supabaseAdmin
          .from('user_profiles')
          .select('whatsapp_notifications_enabled, phone')
          .eq('user_id', userId)
          .single();
        canSendWhatsApp = !!(userProfile?.whatsapp_notifications_enabled && userProfile?.phone);
      } else {
        // Tipo desconocido o payment_issue → verificar ambas tablas
        const [userResult, workerResult] = await Promise.all([
          supabaseAdmin.from('user_profiles').select('phone, whatsapp_notifications_enabled').eq('user_id', userId).single(),
          supabaseAdmin.from('worker_profiles').select('whatsapp_notifications_enabled').eq('user_id', userId).single(),
        ]);
        // Si es worker con whatsapp habilitado en worker_profiles
        if (workerResult.data?.whatsapp_notifications_enabled && userResult.data?.phone) {
          canSendWhatsApp = true;
        } else if (userResult.data?.whatsapp_notifications_enabled && userResult.data?.phone) {
          // Si es cliente con whatsapp habilitado en user_profiles
          canSendWhatsApp = true;
        }
      }

      if (canSendWhatsApp) {
        console.log(`[notifications/create] enviando WhatsApp | tipo=${type} userId=${userId}`);
        try {
          const result = await sendWhatsAppTemplateToUser(userId, message, { title, type });
          if (result.success) {
            console.log(`✅ WhatsApp enviado exitosamente para usuario ${userId}`);
          } else {
            console.warn('⚠️ Error enviando WhatsApp (no crítico):', result.error);
          }
        } catch (err) {
          console.warn('⚠️ Error enviando WhatsApp (no crítico):', err);
        }
      } else {
        console.log(`ℹ️ WhatsApp no enviado para usuario ${userId}: notificaciones deshabilitadas o sin teléfono`);
      }
    } else {
      console.log(`ℹ️ WhatsApp no enviado: tipo ${type} no es importante, notificación deshabilitada o WhatsApp deshabilitado para este tipo`);
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

