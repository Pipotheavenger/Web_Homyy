import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Función para generar un código OTP de 6 dígitos
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Email del admin donde se enviará el OTP
// Puede configurarse mediante variable de entorno, por defecto usa admin@hommy.app
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@hommy.app';

export async function POST(request: NextRequest) {
  try {
    // Verificar variables de entorno críticas
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) {
      console.error('❌ NEXT_PUBLIC_SUPABASE_URL no está configurada');
      return NextResponse.json(
        { error: 'Configuración de Supabase incompleta: falta NEXT_PUBLIC_SUPABASE_URL' },
        { status: 500 }
      );
    }

    if (!serviceRoleKey) {
      console.error('❌ SUPABASE_SERVICE_ROLE_KEY no está configurada');
      return NextResponse.json(
        { error: 'Configuración de Supabase incompleta: falta SUPABASE_SERVICE_ROLE_KEY' },
        { status: 500 }
      );
    }

    // Crear cliente de Supabase
    const supabaseClient = createClient(
      supabaseUrl,
      serviceRoleKey // Usar service role para bypass RLS
    );

    // Generar código OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    // Eliminar OTPs anteriores no verificados para este email
    await supabaseClient
      .from('admin_otp_verifications')
      .delete()
      .eq('email', ADMIN_EMAIL)
      .eq('verified', false);

    // Guardar el OTP en la base de datos
    const { error: insertError } = await supabaseClient
      .from('admin_otp_verifications')
      .insert({
        email: ADMIN_EMAIL,
        otp_code: otpCode,
        expires_at: expiresAt.toISOString(),
        verified: false,
      });

    if (insertError) {
      console.error('Error guardando OTP de admin:', insertError);
      return NextResponse.json(
        { error: 'Error al generar el código OTP' },
        { status: 500 }
      );
    }

    // Enviar email usando Infobip Email API
    console.log('📧 OTP para admin generado:', otpCode);
    console.log('📧 Email destino:', ADMIN_EMAIL);
    console.log('📧 Expira en:', expiresAt.toISOString());

    let emailSent = false;
    let emailError: any = null;

    // Obtener las credenciales de Infobip desde variables de entorno
    const infobipApiKey = process.env.INFOBIP_API_KEY;
    let infobipBaseUrl = process.env.INFOBIP_BASE_URL || 'https://api.infobip.com';
    const infobipEmailFrom = process.env.INFOBIP_EMAIL_FROM || 'no-reply@hommy.app';

    // Asegurar que la URL tenga el protocolo https://
    if (!infobipBaseUrl.startsWith('http://') && !infobipBaseUrl.startsWith('https://')) {
      infobipBaseUrl = `https://${infobipBaseUrl}`;
    }

    if (infobipApiKey) {
      try {
        // URL de redirección con el OTP
        const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin?otp=${otpCode}&step=verify`;
        
        // Mensaje HTML del email
        const emailSubject = 'Código de acceso - Admin Hommy';
        const emailBody = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #6d28d9;">Código de acceso - Admin Hommy</h2>
            <p>Tu código de acceso es:</p>
            <div style="background-color: #f3f4f6; border: 2px solid #6d28d9; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #6d28d9; font-size: 32px; letter-spacing: 8px; margin: 0;">${otpCode}</h1>
            </div>
            <p>Este código expira en <strong>10 minutos</strong>.</p>
            <p>O haz clic en el siguiente enlace para acceder directamente:</p>
            <p style="margin: 20px 0;">
              <a href="${redirectUrl}" style="background-color: #6d28d9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Acceder al Admin
              </a>
            </p>
            <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
              Si no solicitaste este código, puedes ignorar este email.
            </p>
          </div>
        `;

        // Usar Email API v4 con la estructura correcta según Infobip
        const emailPayload = {
          messages: [
            {
              sender: infobipEmailFrom,
              destinations: [
                {
                  to: [
                    {
                      destination: ADMIN_EMAIL,
                    },
                  ],
                },
              ],
              content: {
                subject: emailSubject,
                html: emailBody,
              },
            },
          ],
        };
        
        console.log('📤 Intentando enviar email usando Infobip Email API v4...');
        console.log('📤 Base URL:', infobipBaseUrl);
        console.log('📤 Endpoint: /email/4/messages');
        console.log('📤 From (sender):', infobipEmailFrom);
        console.log('📤 To (destination):', ADMIN_EMAIL);
        console.log('📤 Subject:', emailSubject);
        console.log('📤 Payload:', JSON.stringify(emailPayload, null, 2));

        // Usar el endpoint correcto: /email/4/messages
        const emailResponse = await fetch(`${infobipBaseUrl}/email/4/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `App ${infobipApiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(emailPayload),
          redirect: 'follow', // Seguir redirects automáticamente
        });

        if (emailResponse.ok) {
          const emailData = await emailResponse.json();
          console.log('✅ Email enviado usando Infobip Email API');
          console.log('📧 Respuesta:', emailData);
          emailSent = true;
        } else {
          const errorText = await emailResponse.text();
          let errorJson;
          try {
            errorJson = JSON.parse(errorText);
          } catch {
            errorJson = { message: errorText };
          }
          console.error('❌ Error enviando email con Infobip:', {
            status: emailResponse.status,
            statusText: emailResponse.statusText,
            error: errorJson,
            url: emailResponse.url,
          });
          
          // Mensaje de error más descriptivo
          if (emailResponse.status === 404) {
            emailError = `Endpoint no encontrado (404). Verifica que:
1. El servicio de Email esté habilitado en tu cuenta de Infobip
2. La base URL sea correcta (debe incluir tu subdominio, ej: https://x1dz3q.api.infobip.com)
3. La API Key tenga permisos para enviar emails
URL intentada: ${infobipBaseUrl}/email/4/messages`;
          } else if (errorJson.code === 6029 || errorJson.message?.includes('Sending address invalid') || errorJson.message?.includes('6029')) {
            // Error específico de sender no verificado
            emailError = `Dirección de envío inválida (código 6029). 
El email sender "${infobipEmailFrom}" no está verificado en Infobip.

SOLUCIÓN:
1. Ve a tu panel de Infobip (Email → Verified Senders)
2. Agrega y verifica el email "${infobipEmailFrom}" como sender individual
3. No necesitas verificar el dominio completo, solo el email sender específico
4. O configura INFOBIP_EMAIL_FROM con un email sender ya verificado en Infobip`;
          } else {
            emailError = errorJson.message || errorJson.error || `Error ${emailResponse.status}: ${emailResponse.statusText}`;
            // Si el error contiene información sobre el sender, agregarla
            if (errorJson.errors || errorJson.requestError) {
              const detailedError = JSON.stringify(errorJson.errors || errorJson.requestError);
              emailError += `\n\nDetalles: ${detailedError}`;
            }
          }
        }
      } catch (infobipErr: any) {
        console.error('❌ Excepción usando Infobip Email API:', infobipErr);
        emailError = infobipErr.message || 'Error desconocido al usar Infobip Email API';
      }
    } else {
      console.warn('⚠️ INFOBIP_API_KEY no está configurada, no se puede enviar email');
      emailError = 'Configuración de Infobip no disponible';
    }

    // Devolver respuesta
    if (emailSent) {
      return NextResponse.json({
        success: true,
        message: 'Código OTP enviado al correo electrónico',
        expiresAt: expiresAt.toISOString(),
        // En desarrollo, también devolvemos el código para debugging
        ...(process.env.NODE_ENV === 'development' && { otp: otpCode }),
      });
    } else {
      // Aún así devolvemos éxito porque el OTP se guardó correctamente
      // En desarrollo o si el email falla, devolvemos el código
      return NextResponse.json({
        success: true,
        message: emailError 
          ? `Código OTP generado pero el email falló: ${emailError}. Revisa los logs.`
          : 'Código OTP generado. Revisa tu correo (si no llega, revisa los logs).',
        expiresAt: expiresAt.toISOString(),
        // Siempre devolver el código cuando el email falla para facilitar debugging
        otp: otpCode,
        emailError: emailError || 'No se pudo enviar el email. Verifica INFOBIP_API_KEY o configura el servicio de email.',
        debug: {
          supabaseConfigured: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        },
      });
    }
  } catch (error: any) {
    console.error('❌ Error en send admin OTP:', error);
    console.error('❌ Stack trace:', error.stack);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error.message || 'Error desconocido',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
