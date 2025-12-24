import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Función para generar un código OTP de 6 dígitos
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Función para normalizar el número de teléfono
function normalizePhoneNumber(phone: string): string {
  if (!phone) return '';
  
  // Eliminar todos los caracteres que no sean números o +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // Si no empieza con +, agregar +57 (código de Colombia por defecto)
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
    // Crear cliente de Supabase
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Verificar si SMS Auth está habilitado
    const { data: smsSetting, error: smsError } = await supabaseClient
      .from('system_settings')
      .select('value')
      .eq('key', 'sms_auth_enabled')
      .single();

    // Si no existe la configuración o está deshabilitada
    if (!smsError && smsSetting?.value && smsSetting.value.enabled === false) {
      return NextResponse.json(
        { error: 'La autenticación por SMS está deshabilitada' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { phoneNumber } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Número de teléfono es requerido' },
        { status: 400 }
      );
    }

    // Normalizar el número de teléfono
    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    if (!normalizedPhone.startsWith('+') || normalizedPhone.length < 10) {
      return NextResponse.json(
        { error: 'Número de teléfono inválido' },
        { status: 400 }
      );
    }

    // Obtener el token de autenticación del header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Establecer la sesión usando el token para que RLS funcione correctamente
    // Primero necesitamos obtener el refresh token, pero como solo tenemos access_token,
    // usaremos el método getUser para verificar y luego estableceremos los headers
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

    // Generar código OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    // Eliminar OTPs anteriores no verificados para este usuario y número
    const { error: deleteError } = await supabaseWithAuth
      .from('otp_verifications')
      .delete()
      .eq('user_id', userId)
      .eq('phone_number', normalizedPhone)
      .eq('verified', false);

    if (deleteError) {
      console.error('Error eliminando OTPs anteriores:', deleteError);
    }

    // Guardar el OTP en la base de datos
    const { error: insertError } = await supabaseWithAuth
      .from('otp_verifications')
      .insert({
        user_id: userId,
        phone_number: normalizedPhone,
        otp_code: otpCode,
        expires_at: expiresAt.toISOString(),
        verified: false,
      });

    if (insertError) {
      console.error('Error guardando OTP:', insertError);
      console.error('Detalles del error:', JSON.stringify(insertError, null, 2));
      return NextResponse.json(
        { error: 'Error al guardar el código OTP', details: insertError.message },
        { status: 500 }
      );
    }

    // Obtener las credenciales de Infobip desde variables de entorno
    const infobipApiKey = process.env.INFOBIP_API_KEY;
    let infobipBaseUrl = process.env.INFOBIP_BASE_URL || 'https://api.infobip.com';
    
    // Asegurar que la URL tenga el protocolo https://
    if (!infobipBaseUrl.startsWith('http://') && !infobipBaseUrl.startsWith('https://')) {
      infobipBaseUrl = `https://${infobipBaseUrl}`;
    }

    if (!infobipApiKey) {
      console.error('INFOBIP_API_KEY no está configurada');
      return NextResponse.json(
        { error: 'Configuración del servicio SMS no disponible' },
        { status: 500 }
      );
    }

    // Enviar SMS usando Infobip
    const smsMessage = `Tu código de verificación Hommy es: ${otpCode}. Válido por 10 minutos.`;
    
    // Remover el + del número de teléfono para Infobip (solo números)
    const phoneForInfobip = normalizedPhone.replace(/\+/g, '');
    
    try {
      const senderId = process.env.INFOBIP_SENDER_ID || '447491163443';
      const messagePayload = {
        messages: [
          {
            destinations: [{ to: phoneForInfobip }],
            from: senderId,
            text: smsMessage,
          },
        ],
      };
      
      const postData = JSON.stringify(messagePayload);
      
      console.log('📤 Enviando SMS a Infobip:');
      console.log('URL:', `${infobipBaseUrl}/sms/2/text/advanced`);
      console.log('To:', phoneForInfobip);
      console.log('From:', senderId);
      console.log('Message:', smsMessage);
      console.log('Payload:', postData);

      const infobipResponse = await fetch(`${infobipBaseUrl}/sms/2/text/advanced`, {
        method: 'POST',
        headers: {
          'Authorization': `App ${infobipApiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: postData,
        redirect: 'follow',
      });

      if (!infobipResponse.ok) {
        let errorData;
        try {
          errorData = await infobipResponse.json();
        } catch {
          errorData = await infobipResponse.text();
        }
        console.error('❌ Error enviando SMS con Infobip:');
        console.error('Status:', infobipResponse.status);
        console.error('StatusText:', infobipResponse.statusText);
        console.error('Response:', JSON.stringify(errorData, null, 2));
        console.error('Request data:', JSON.stringify(JSON.parse(postData), null, 2));
        console.error('URL:', `${infobipBaseUrl}/sms/2/text/advanced`);
        
        // Eliminar el OTP si falla el envío
        await supabaseWithAuth
          .from('otp_verifications')
          .delete()
          .eq('user_id', userId)
          .eq('phone_number', normalizedPhone)
          .eq('otp_code', otpCode);

        return NextResponse.json(
          { 
            error: 'Error al enviar el SMS. Por favor intenta de nuevo.',
            details: errorData
          },
          { status: 500 }
        );
      }

      const result = await infobipResponse.json();
      console.log('✅ SMS enviado exitosamente:', JSON.stringify(result, null, 2));

      return NextResponse.json({
        success: true,
        message: 'Código OTP enviado exitosamente',
        expiresAt: expiresAt.toISOString(),
      });
    } catch (infobipError: any) {
      console.error('Error en la llamada a Infobip:', infobipError);
      
      // Eliminar el OTP si falla el envío
      await supabaseWithAuth
        .from('otp_verifications')
        .delete()
        .eq('user_id', userId)
        .eq('phone_number', normalizedPhone)
        .eq('otp_code', otpCode);

      return NextResponse.json(
        { error: 'Error al enviar el SMS. Por favor intenta de nuevo.' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error en send OTP:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
