import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * API Route para activar WhatsApp por defecto para todos los usuarios con móvil verificado
 * Solo accesible por administradores
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar que SUPABASE_SERVICE_ROLE_KEY esté configurada
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'SUPABASE_SERVICE_ROLE_KEY no está configurada' },
        { status: 500 }
      );
    }

    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // Usar service role para bypass RLS
    );

    // Activar WhatsApp para todos los usuarios con móvil verificado
    // Actualizar los que tienen null
    const { count: countNull, error: errorNull } = await supabaseClient
      .from('user_profiles')
      .update({ whatsapp_notifications_enabled: true })
      .eq('movil_verificado', true)
      .is('whatsapp_notifications_enabled', null)
      .select('*', { count: 'exact', head: true });

    // Actualizar los que tienen false
    const { count: countFalse, error: errorFalse } = await supabaseClient
      .from('user_profiles')
      .update({ whatsapp_notifications_enabled: true })
      .eq('movil_verificado', true)
      .eq('whatsapp_notifications_enabled', false)
      .select('*', { count: 'exact', head: true });

    if (errorNull) {
      console.error('Error activando WhatsApp (null):', errorNull);
    }
    if (errorFalse) {
      console.error('Error activando WhatsApp (false):', errorFalse);
    }

    if (errorNull && errorFalse) {
      return NextResponse.json(
        { 
          error: 'Error activando WhatsApp',
          details: errorNull.message || errorFalse.message 
        },
        { status: 500 }
      );
    }

    const totalUpdated = (countNull || 0) + (countFalse || 0);

    return NextResponse.json({
      success: true,
      message: `WhatsApp activado por defecto para ${totalUpdated} usuarios`,
      updated: totalUpdated,
      details: {
        nullUpdated: countNull || 0,
        falseUpdated: countFalse || 0
      }
    });
  } catch (error: any) {
    console.error('Error en activate-whatsapp-default:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

