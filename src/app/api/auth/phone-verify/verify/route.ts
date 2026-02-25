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
    const { phoneNumber, otpCode, userId } = await request.json();

    if (!phoneNumber || !otpCode) {
      return NextResponse.json(
        { error: 'El número de teléfono y el código son requeridos' },
        { status: 400 }
      );
    }

    const digits = phoneNumber.replace(/\s/g, '');

    // Buscar el registro más reciente no expirado ni verificado
    const { data: verification, error: fetchError } = await supabaseAdmin
      .from('phone_verifications')
      .select('*')
      .eq('phone_number', digits)
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !verification) {
      return NextResponse.json(
        { error: 'No hay un código de verificación activo. Solicita uno nuevo.' },
        { status: 400 }
      );
    }

    // Verificar máximo de intentos (5)
    if (verification.attempts >= 5) {
      return NextResponse.json(
        { error: 'Has excedido el número máximo de intentos. Solicita un nuevo código.' },
        { status: 429 }
      );
    }

    // Incrementar intentos
    const newAttempts = verification.attempts + 1;
    await supabaseAdmin
      .from('phone_verifications')
      .update({ attempts: newAttempts })
      .eq('id', verification.id);

    // Comparar código
    if (verification.otp_code !== otpCode) {
      const remaining = 5 - newAttempts;
      return NextResponse.json(
        {
          error: `Código incorrecto. ${remaining > 0 ? `Te quedan ${remaining} intento${remaining === 1 ? '' : 's'}.` : 'Has agotado todos los intentos.'}`,
          attemptsRemaining: remaining,
        },
        { status: 400 }
      );
    }

    // Código correcto: marcar como verificado
    await supabaseAdmin
      .from('phone_verifications')
      .update({ verified: true })
      .eq('id', verification.id);

    // Si se proporcionó userId, marcar el teléfono como verificado en los perfiles
    if (userId) {
      await supabaseAdmin
        .from('user_profiles')
        .update({ movil_verificado: true })
        .eq('user_id', userId);

      // Intentar actualizar también en worker_profiles (puede no existir)
      await supabaseAdmin
        .from('worker_profiles')
        .update({ movil_verificado: true })
        .eq('user_id', userId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error en /api/auth/phone-verify/verify:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}
