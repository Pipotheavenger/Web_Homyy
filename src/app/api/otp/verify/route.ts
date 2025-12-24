import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Función para normalizar el número de teléfono
function normalizePhoneNumber(phone: string): string {
  if (!phone) return '';
  
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  if (!cleaned.startsWith('+')) {
    if (cleaned.length === 10) {
      cleaned = '+57' + cleaned;
    } else {
      cleaned = '+57' + cleaned.replace(/^57/, '');
    }
  }
  
  return cleaned;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, otpCode } = body;

    if (!phoneNumber || !otpCode) {
      return NextResponse.json(
        { error: 'Número de teléfono y código OTP son requeridos' },
        { status: 400 }
      );
    }

    // Validar formato del código OTP
    if (!/^\d{6}$/.test(otpCode)) {
      return NextResponse.json(
        { error: 'El código OTP debe tener 6 dígitos' },
        { status: 400 }
      );
    }

    // Normalizar el número de teléfono
    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    // Obtener el token de autenticación del header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Crear cliente de Supabase
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Verificar que el usuario esté autenticado usando el token
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const userId = user.id;

    // Crear un nuevo cliente con el token en los headers para las operaciones de base de datos
    const supabaseWithAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    // Buscar el OTP válido
    const { data: otpData, error: otpError } = await supabaseWithAuth
      .from('otp_verifications')
      .select('*')
      .eq('user_id', userId)
      .eq('phone_number', normalizedPhone)
      .eq('otp_code', otpCode)
      .eq('verified', false)
      .single();

    if (otpError || !otpData) {
      return NextResponse.json(
        { error: 'Código OTP inválido' },
        { status: 400 }
      );
    }

    // Verificar si el OTP ha expirado
    const expiresAt = new Date(otpData.expires_at);
    if (expiresAt < new Date()) {
      // Marcar como expirado (opcional: eliminar el registro)
      await supabaseWithAuth
        .from('otp_verifications')
        .delete()
        .eq('id', otpData.id);

      return NextResponse.json(
        { error: 'El código OTP ha expirado. Por favor solicita uno nuevo.' },
        { status: 400 }
      );
    }

    // Marcar el OTP como verificado
    const { error: updateError } = await supabaseWithAuth
      .from('otp_verifications')
      .update({
        verified: true,
        verified_at: new Date().toISOString(),
      })
      .eq('id', otpData.id);

    if (updateError) {
      console.error('Error actualizando OTP:', updateError);
      return NextResponse.json(
        { error: 'Error al verificar el código' },
        { status: 500 }
      );
    }

    // Actualizar el estado de verificación en user_profiles
    const { error: profileUpdateError } = await supabaseWithAuth
      .from('user_profiles')
      .update({ movil_verificado: true })
      .eq('user_id', userId);

    if (profileUpdateError) {
      console.error('Error actualizando perfil de usuario:', profileUpdateError);
      // No fallamos aquí, el OTP ya fue verificado
    }

    // Verificar si es worker y actualizar también worker_profiles
    const { data: userProfile } = await supabaseWithAuth
      .from('user_profiles')
      .select('user_type')
      .eq('user_id', userId)
      .single();

    if (userProfile?.user_type === 'worker') {
      await supabaseWithAuth
        .from('worker_profiles')
        .update({ movil_verificado: true })
        .eq('user_id', userId);
    }

    return NextResponse.json({
      success: true,
      message: 'Móvil verificado exitosamente',
    });
  } catch (error: any) {
    console.error('Error en verify OTP:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
