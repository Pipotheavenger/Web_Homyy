import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Email del admin donde se enviará el OTP
// Debe ser el mismo que en send/route.ts
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@hommy.app';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { otpCode } = body;

    if (!otpCode || otpCode.length !== 6) {
      return NextResponse.json(
        { error: 'Código OTP inválido' },
        { status: 400 }
      );
    }

    // Crear cliente de Supabase
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // Usar service role para bypass RLS
    );

    // Buscar OTP válido y no expirado
    const { data: otpData, error: queryError } = await supabaseClient
      .from('admin_otp_verifications')
      .select('*')
      .eq('email', ADMIN_EMAIL)
      .eq('otp_code', otpCode)
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (queryError || !otpData) {
      return NextResponse.json(
        { error: 'Código OTP inválido o expirado' },
        { status: 400 }
      );
    }

    // Marcar OTP como verificado
    const { error: updateError } = await supabaseClient
      .from('admin_otp_verifications')
      .update({
        verified: true,
        verified_at: new Date().toISOString(),
      })
      .eq('id', otpData.id);

    if (updateError) {
      console.error('Error marcando OTP como verificado:', updateError);
      return NextResponse.json(
        { error: 'Error al verificar el código' },
        { status: 500 }
      );
    }

    // Eliminar todos los OTPs no verificados antiguos para limpiar
    await supabaseClient
      .from('admin_otp_verifications')
      .delete()
      .eq('email', ADMIN_EMAIL)
      .eq('verified', false);

    return NextResponse.json({
      success: true,
      message: 'Código OTP verificado correctamente',
    });
  } catch (error: any) {
    console.error('Error en verify admin OTP:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
