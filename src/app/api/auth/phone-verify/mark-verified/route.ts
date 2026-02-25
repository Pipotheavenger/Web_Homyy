import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'El userId es requerido' },
        { status: 400 }
      );
    }

    // Actualizar movil_verificado en user_profiles
    const { error: userError } = await supabaseAdmin
      .from('user_profiles')
      .update({ movil_verificado: true })
      .eq('user_id', userId);

    if (userError) {
      console.error('Error actualizando user_profiles:', userError);
    }

    // Actualizar movil_verificado en worker_profiles (si existe)
    const { error: workerError } = await supabaseAdmin
      .from('worker_profiles')
      .update({ movil_verificado: true })
      .eq('user_id', userId);

    if (workerError) {
      // No es error crítico, puede que no sea worker
      console.log('No se actualizó worker_profiles (puede no existir):', workerError.message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error en /api/auth/phone-verify/mark-verified:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}
