import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendVerificationSMS } from '@/lib/services/sns';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

function generateOTP(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return String(array[0] % 1000000).padStart(6, '0');
}

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'El número de teléfono es requerido' },
        { status: 400 }
      );
    }

    // Validar formato: 10 dígitos
    const digits = phoneNumber.replace(/\s/g, '');
    if (!/^\d{10}$/.test(digits)) {
      return NextResponse.json(
        { error: 'El número debe tener exactamente 10 dígitos' },
        { status: 400 }
      );
    }

    // Rate limit: max 3 envíos por teléfono en 10 minutos
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { data: recentSends, error: countError } = await supabaseAdmin
      .from('phone_verifications')
      .select('id, created_at')
      .eq('phone_number', digits)
      .gte('created_at', tenMinutesAgo)
      .order('created_at', { ascending: true });

    if (countError) {
      console.error('Error consultando rate limit:', countError);
      return NextResponse.json(
        { error: 'Error interno del servidor' },
        { status: 500 }
      );
    }

    if (recentSends && recentSends.length >= 3) {
      // Calcular cuántos segundos faltan para que expire el envío más antiguo
      const oldestSend = new Date(recentSends[0].created_at).getTime();
      const expiresAt = oldestSend + 10 * 60 * 1000;
      const retryAfterSeconds = Math.max(1, Math.ceil((expiresAt - Date.now()) / 1000));

      return NextResponse.json(
        { error: 'Has excedido el límite de envíos.', retryAfterSeconds },
        { status: 429 }
      );
    }

    // Generar OTP de 6 dígitos
    const otpCode = generateOTP();

    // Guardar en phone_verifications con expiración de 10 minutos
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const { error: insertError } = await supabaseAdmin
      .from('phone_verifications')
      .insert({
        phone_number: digits,
        otp_code: otpCode,
        expires_at: expiresAt,
      });

    if (insertError) {
      console.error('Error guardando OTP:', insertError);
      return NextResponse.json(
        { error: 'Error interno del servidor' },
        { status: 500 }
      );
    }

    // Enviar SMS
    const smsResult = await sendVerificationSMS(digits, otpCode);

    if (!smsResult.success) {
      const userMessage =
        smsResult.error?.includes('credential') || smsResult.error?.includes('no está configurado')
          ? 'El envío de SMS no está configurado. Contacta al administrador.'
          : smsResult.error || 'Error al enviar el SMS';
      return NextResponse.json(
        { error: userMessage },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error en /api/auth/phone-verify/send:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}
