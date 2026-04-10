/**
 * Servicio para enviar SMS usando AWS SNS
 */

import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

function getSNSClient(): SNSClient | null {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY?.trim();
  if (!accessKeyId || !secretAccessKey) {
    return null;
  }
  return new SNSClient({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

/**
 * Convierte un número de teléfono colombiano a formato E.164
 * Ejemplo: "300 123 4567" → "+573001234567"
 */
export function formatPhoneForSNS(phone: string): string {
  if (!phone) return '';

  const digits = phone.replace(/\D/g, '');

  if (digits.startsWith('57') && digits.length === 12) {
    return `+${digits}`;
  }

  if (digits.length === 10) {
    return `+57${digits}`;
  }

  return `+57${digits}`;
}

/**
 * Enviar un SMS de verificación usando AWS SNS
 */
export async function sendVerificationSMS(
  phoneNumber: string,
  otpCode: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const snsClient = getSNSClient();
    if (!snsClient) {
      console.warn(
        '⚠️ AWS SNS no configurado: faltan AWS_ACCESS_KEY_ID o AWS_SECRET_ACCESS_KEY'
      );
      return {
        success: false,
        error: 'El envío de SMS no está configurado. Contacta al administrador.',
      };
    }

    const formattedPhone = formatPhoneForSNS(phoneNumber);

    const command = new PublishCommand({
      PhoneNumber: formattedPhone,
      Message: `Tu código de verificación de Hommy es: ${otpCode}. Válido por 10 minutos.`,
      MessageAttributes: {
        'AWS.SNS.SMS.SMSType': {
          DataType: 'String',
          StringValue: 'Transactional',
        },
      },
    });

    const out = await snsClient.send(command);
    console.log(
      '✅ SMS enviado exitosamente a:',
      formattedPhone,
      '| MessageId:',
      out.MessageId
    );
    return { success: true };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Error desconocido al enviar SMS';
    console.error('❌ Error enviando SMS:', error);
    return {
      success: false,
      error: message,
    };
  }
}
