/**
 * Servicio para enviar SMS usando AWS SNS
 */

import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

const snsClient = new SNSClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

/**
 * Convierte un número de teléfono colombiano a formato E.164
 * Ejemplo: "300 123 4567" → "+573001234567"
 */
export function formatPhoneForSNS(phone: string): string {
  if (!phone) return '';

  // Eliminar todo excepto dígitos
  const digits = phone.replace(/\D/g, '');

  // Si ya tiene código de país (57), agregar +
  if (digits.startsWith('57') && digits.length === 12) {
    return `+${digits}`;
  }

  // Si son 10 dígitos (número colombiano sin código de país)
  if (digits.length === 10) {
    return `+57${digits}`;
  }

  // Fallback: agregar +57 si no lo tiene
  return `+57${digits}`;
}

/**
 * Enviar un SMS de verificación usando AWS SNS
 * @param phoneNumber Número de teléfono (se formatea automáticamente a E.164)
 * @param otpCode Código OTP de 6 dígitos
 * @returns Promise con el resultado del envío
 */
export async function sendVerificationSMS(
  phoneNumber: string,
  otpCode: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const formattedPhone = formatPhoneForSNS(phoneNumber);

    const command = new PublishCommand({
      PhoneNumber: formattedPhone,
      Message: `Tu código de verificación de Hommy es: ${otpCode}. Válido por 10 minutos.`,
      MessageAttributes: {
        'AWS.SNS.SMS.SMSType': {
          DataType: 'String',
          StringValue: 'Transactional',
        },
        'AWS.SNS.SMS.SenderID': {
          DataType: 'String',
          StringValue: 'Hommy',
        },
      },
    });

    await snsClient.send(command);
    console.log('✅ SMS enviado exitosamente a:', formattedPhone);
    return { success: true };
  } catch (error: any) {
    console.error('❌ Error enviando SMS:', error);
    return {
      success: false,
      error: error.message || 'Error desconocido al enviar SMS',
    };
  }
}
