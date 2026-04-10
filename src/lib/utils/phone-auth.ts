export function normalizePhoneToDigits(input: string): string {
  return (input ?? '').replace(/\D/g, '');
}

/**
 * Supabase Auth still needs an email for password auth in many setups.
 * We derive a stable, non-user-facing email from the phone digits.
 *
 * IMPORTANT: This is an internal identifier only; do not display it in UI.
 */
export function phoneToAuthEmail(phoneDigits: string): string {
  const digits = normalizePhoneToDigits(phoneDigits);
  if (digits.length === 0) return '';
  return `phone_${digits}@hommy.local`;
}

export function isValidMxPhone10Digits(phone: string): boolean {
  const digits = normalizePhoneToDigits(phone);
  return /^\d{10}$/.test(digits);
}

/** Formato visual: XXX XXX XXXX (máx. 10 dígitos nacionales). */
export function formatColombiaMobileDisplay(raw: string): string {
  const inputValue = normalizePhoneToDigits(raw).slice(0, 10);
  if (inputValue.length <= 3) return inputValue;
  let formattedValue = inputValue.slice(0, 3);
  if (inputValue.length >= 6) {
    formattedValue += ' ' + inputValue.slice(3, 6);
    if (inputValue.length > 6) {
      formattedValue += ' ' + inputValue.slice(6);
    }
  } else {
    formattedValue += ' ' + inputValue.slice(3);
  }
  return formattedValue;
}

