/**
 * Validador de información sensible
 * Detecta y bloquea el intercambio de datos sensibles como:
 * - Números telefónicos
 * - Correos electrónicos
 * - Precios/números monetarios
 * 
 * PERMITE direcciones y lugares
 */

/**
 * Verifica si el texto tiene contexto de dirección
 * Usa word boundaries para evitar falsos positivos (ej: "dos" dentro de "veintiunodos")
 */
function hasAddressContext(text: string): boolean {
  // Usar word boundaries para que solo detecte palabras completas de dirección
  // Esto evita que "dos" en "veintiunodos" sea detectado como dirección
  const addressPattern1 = /\b(calle|carrera|avenida|avenue|street|road|casa|apt|apartamento|número|numero|n°|nro|nro\.|km|kilómetro|kilometro|dirección|direccion|address|barrio|sector|zona)\b/i;
  const addressPattern2 = /\bno\s+\d+/i; // "no" seguido de número
  const addressPattern3 = /\b(número|numero)\s*\d+/i; // "número" seguido de número
  
  const hasContext = addressPattern1.test(text) || addressPattern2.test(text) || addressPattern3.test(text);
  
  if (hasContext) {
    console.log('[SENSITIVE DATA VALIDATOR] Contexto de dirección detectado en:', text);
  }
  
  return hasContext;
}

/**
 * Valida si un texto contiene información sensible
 * @param text - Texto a validar
 * @returns true si contiene información sensible, false si es seguro
 */
export function containsSensitiveData(text: string): boolean {
  if (!text || typeof text !== 'string') return false;

  const normalizedText = text.toLowerCase().trim();

  // 1. Detectar correos electrónicos
  // Patrón: texto@texto.texto
  const emailPattern = /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g;
  if (emailPattern.test(text)) {
    return true;
  }

  // 2. Detectar números telefónicos
  // Patrones comunes:
  // - Números colombianos: 300 123 4567, 300-123-4567, 3001234567
  // - Números internacionales: +57 300 123 4567, +1 234 567 8900
  // - Números con espacios, guiones, paréntesis: (300) 123-4567, 300.123.4567
  // - Números de 6 dígitos sin formato: 321526 (celulares colombianos)
  
  // Remover espacios, guiones, puntos, paréntesis para normalizar
  const phoneNormalized = text.replace(/[\s\-\.\(\)]/g, '');
  
  // Detectar números telefónicos (6-15 dígitos, posiblemente con código de país)
  // Excluir números muy cortos que podrían ser direcciones (ej: "Calle 123")
  const phonePattern = /(\+?\d{1,4}[\s\-\.]?)?\(?\d{3,4}\)?[\s\-\.]?\d{3,4}[\s\-\.]?\d{3,7}/g;
  
  // También detectar números de 6 dígitos consecutivos sin formato específico
  const sixDigitPhonePattern = /\b\d{6}\b/g;
  
  // Verificar si hay coincidencias que no sean parte de direcciones
  const phoneMatches = text.match(phonePattern);
  const sixDigitMatches = text.match(sixDigitPhonePattern);
  
  if (phoneMatches || sixDigitMatches) {
    // Filtrar números que podrían ser direcciones (números muy cortos o en contexto de dirección)
    const addressContext = hasAddressContext(text);
    
    // Si tiene contexto de dirección, verificar si el número es muy corto (probablemente dirección)
    if (addressContext) {
      // Permitir números cortos en contexto de dirección (ej: "Calle 123")
      const shortNumberPattern = /\b\d{1,4}\b/;
      const isShortNumber = phoneMatches?.some(match => {
        const digitsOnly = match.replace(/\D/g, '');
        return digitsOnly.length <= 4 && shortNumberPattern.test(match);
      });
      
      if (isShortNumber) {
        // Probablemente es una dirección, no un teléfono
        // Continuar con otras validaciones
      } else {
        // Número largo en contexto de dirección, pero podría ser teléfono
        console.log('[SENSITIVE DATA VALIDATOR] BLOQUEADO: Número telefónico detectado en contexto de dirección');
        return true;
      }
    } else {
      // Sin contexto de dirección, cualquier número telefónico es sospechoso
      // Verificar números con formato específico (7+ dígitos)
      if (phoneMatches) {
        const digitsOnly = phoneNormalized.replace(/\D/g, '');
        if (digitsOnly.length >= 7) {
          console.log('[SENSITIVE DATA VALIDATOR] BLOQUEADO: Número telefónico con formato detectado');
          return true;
        }
      }
      
      // Verificar números de 6 dígitos sin formato específico
      if (sixDigitMatches) {
        // Verificar que no sean parte de un precio o cantidad monetaria
        const isPriceContext = /\b(precio|cost[oa]|valor|pago|tarifa|honorario|honorarios|pesos|cop|usd|eur|dolares|dólares|dollar|euro)\s*:?\s*\d{6}\b/gi.test(text);
        // Verificar que no sean parte de una dirección
        const isAddressNumber = /\b(calle|carrera|avenida|avenue|street|road|casa|apt|apartamento|número|numero|n°|nro|nro\.|km|kilómetro|kilometro|dirección|direccion|address|barrio|sector|zona)\s+\d{6}\b/i.test(text);
        
        if (!isPriceContext && !isAddressNumber) {
          console.log('[SENSITIVE DATA VALIDATOR] BLOQUEADO: Número telefónico de 6 dígitos detectado:', sixDigitMatches);
          return true;
        }
      }
    }
  }

  // 2.1. Detectar números telefónicos escritos en palabras
  // Lista completa de números en palabras (incluyendo todas las variantes posibles)
  const numberWordsList = [
    // 0-9
    'cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve',
    // 10-19
    'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'dieciseis', 'diecisiete', 'dieciocho', 'diecinueve',
    // 20-29 (con TODAS las variantes posibles)
    'veinte', 'veintiuno', 'veintinuno', 'veintidós', 'veintidos', 'veintitrés', 'veintitres', 'veinticuatro', 'veinticinco',
    'veintiséis', 'veintiseis', 'veintisiete', 'veintiocho', 'veintinueve',
    // 30-99 (decenas)
    'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa',
    // Compuestos 30-39
    'treinta y uno', 'treinta y dos', 'treinta y tres', 'treinta y cuatro', 'treinta y cinco',
    'treinta y seis', 'treinta y siete', 'treinta y ocho', 'treinta y nueve',
    // Centenas y miles
    'cien', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos',
    'mil', 'millón', 'millones'
  ];

  // Función auxiliar para verificar si una palabra es un número
  const isNumberWord = (word: string): boolean => {
    const lowerWord = word.toLowerCase().trim();
    if (!lowerWord) return false;
    
    // Verificar coincidencia exacta primero (más rápido)
    if (numberWordsList.includes(lowerWord)) {
      return true;
    }
    
    // Normalizar sin acentos
    const normalizedWord = lowerWord.replace(/[áéíóú]/g, (m) => {
      const map: Record<string, string> = { 'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u' };
      return map[m] || m;
    });
    
    // Verificar coincidencia exacta después de normalizar
    if (numberWordsList.includes(normalizedWord)) {
      return true;
    }
    
    // Verificar variantes específicas conocidas: "veintinuno" vs "veintiuno"
    // Estas son variantes comunes que deben ser tratadas como el mismo número
    if (normalizedWord.startsWith('veinti') || normalizedWord.startsWith('veintin')) {
      // Extraer el número final (uno, dos, tres, etc.)
      // Manejar tanto "veintiuno" como "veintinuno"
      let wordSuffix = '';
      if (normalizedWord.startsWith('veintin')) {
        wordSuffix = normalizedWord.replace(/^veintin/, '');
      } else if (normalizedWord.startsWith('veinti')) {
        wordSuffix = normalizedWord.replace(/^veinti/, '');
      }
      
      if (wordSuffix && wordSuffix.length > 0) {
        // Verificar si el sufijo es un número válido
        const validSuffixes = ['uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
        if (validSuffixes.includes(wordSuffix)) {
          return true;
        }
      }
    }
    
    // Verificar comparando con cada número de la lista (para otras variantes)
    for (const num of numberWordsList) {
      const normalizedNum = num.toLowerCase().replace(/[áéíóú]/g, (m) => {
        const map: Record<string, string> = { 'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u' };
        return map[m] || m;
      });
      
      // Coincidencia exacta después de normalizar
      if (normalizedWord === normalizedNum) {
        return true;
      }
      
      // Para palabras que empiezan con "veinti" o "veintin", verificar si el sufijo coincide
      if ((normalizedWord.startsWith('veinti') || normalizedWord.startsWith('veintin')) &&
          (normalizedNum.startsWith('veinti') || normalizedNum.startsWith('veintin'))) {
        const wordSuffix = normalizedWord.replace(/^veint(in|i)/, '');
        const numSuffix = normalizedNum.replace(/^veint(in|i)/, '');
        if (wordSuffix === numSuffix && wordSuffix.length > 0) {
          return true;
        }
      }
      
      // Para palabras largas (7+ caracteres), verificar si una contiene a la otra
      // Esto captura variantes como "veintinuno" vs "veintiuno"
      if (normalizedWord.length >= 7 && normalizedNum.length >= 7) {
        // Si las primeras 7 letras coinciden, probablemente es la misma palabra
        if (normalizedWord.substring(0, 7) === normalizedNum.substring(0, 7)) {
          return true;
        }
        // Si una contiene completamente a la otra (con diferencia de máximo 2 caracteres), también es una variante
        if ((normalizedWord.includes(normalizedNum) && Math.abs(normalizedWord.length - normalizedNum.length) <= 2) ||
            (normalizedNum.includes(normalizedWord) && Math.abs(normalizedNum.length - normalizedWord.length) <= 2)) {
          return true;
        }
      }
    }
    
    return false;
  };

  // Verificar si hay contexto de dirección primero
  const addressContext = hasAddressContext(text);
  console.log('[SENSITIVE DATA VALIDATOR] Texto recibido:', text);
  console.log('[SENSITIVE DATA VALIDATOR] Tiene contexto de dirección:', addressContext);
  
  // IMPORTANTE: Verificar números en palabras ANTES de considerar el contexto de dirección
  // Si hay números en palabras, bloquear incluso si hay contexto de dirección
  // (a menos que sea claramente una dirección como "calle 123")
  
  // Escapar caracteres especiales en regex
  const escapedNumberWords = numberWordsList.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  // Ordenar por longitud descendente para capturar números compuestos primero
  escapedNumberWords.sort((a, b) => b.length - a.length);
  
  // Crear patrón regex que busque números en palabras SIN word boundaries
  const regexPattern = `\\b(${escapedNumberWords.join('|')})\\b`;
  const numberWordsPattern = new RegExp(regexPattern, 'gi');
  
  // Normalizar el texto completamente (sin acentos, todo minúsculas, sin puntuación)
  const cleanText = normalizedText.replace(/[.,;:!?¿¡\-_()\[\]{}'"]/g, ' ');
  
  // Dividir en palabras
  const words = cleanText.split(/\s+/).filter(w => w.length > 0);
  
  // Verificar si hay números en palabras
  let hasNumberWords = false;
  const numberWordsFound: string[] = [];
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    
    // Verificar si es un número usando la función auxiliar
    if (isNumberWord(word)) {
      hasNumberWords = true;
      numberWordsFound.push(word);
    }
    
    // También verificar si la palabra contiene algún número concatenado
    const wordMatches = word.match(numberWordsPattern);
    if (wordMatches && wordMatches.length >= 1) {
      hasNumberWords = true;
      numberWordsFound.push(...wordMatches);
    }
  }
  
  // También verificar con regex en todo el texto
  const regexMatches = normalizedText.match(numberWordsPattern);
  if (regexMatches && regexMatches.length >= 1) {
    hasNumberWords = true;
    numberWordsFound.push(...regexMatches);
  }
  
  console.log('[SENSITIVE DATA VALIDATOR] Números encontrados en palabras:', numberWordsFound);
  
  // Si hay números en palabras Y hay contexto de dirección, verificar si es realmente una dirección
  // Una dirección real tiene palabras como "calle", "carrera", "avenida" seguido de números pequeños (1-4 dígitos)
  if (hasNumberWords && addressContext) {
    // Verificar si es una dirección real (patrón: palabra de dirección + número pequeño)
    const realAddressPattern = /\b(calle|carrera|avenida|avenue|street|road|casa|apt|apartamento|dirección|direccion|address|barrio|sector|zona)\s+\d{1,4}\b/i;
    const isRealAddress = realAddressPattern.test(text);
    
    console.log('[SENSITIVE DATA VALIDATOR] ¿Es una dirección real?', isRealAddress);
    
    // Si NO es una dirección real pero tiene números en palabras, bloquear
    if (!isRealAddress) {
      console.log('[SENSITIVE DATA VALIDATOR] BLOQUEADO: Tiene números en palabras pero NO es una dirección real');
      return true;
    }
    // Si es una dirección real, permitir (continuar con otras validaciones)
  }
  
  // Si hay números en palabras y NO hay contexto de dirección, bloquear
  if (hasNumberWords && !addressContext) {
    console.log('[SENSITIVE DATA VALIDATOR] BLOQUEADO: Se encontraron números en letras sin contexto de dirección');
    return true;
  }
  
  // Continuar con otras validaciones (emails, números telefónicos numéricos, etc.)

  // 3. Detectar precios/números monetarios
  // Patrones: $100, $100.000, 100 pesos, 100.000 COP, etc.
  const pricePatterns = [
    /\$\s*\d+([.,]\d{3})*([.,]\d{2})?\b/g, // $100, $100.000, $100.000,50
    /\b\d+([.,]\d{3})*([.,]\d{2})?\s*(pesos|cop|usd|eur|dolares|dólares|dollar|euro)\b/gi, // 100 pesos, 100.000 COP
    /\b(precio|cost[oa]|valor|pago|tarifa|honorario|honorarios)\s*:?\s*\d+([.,]\d{3})*\b/gi, // precio: 100000
  ];

  for (const pattern of pricePatterns) {
    if (pattern.test(text)) {
      return true;
    }
  }

  // 3.1. Detectar números escritos en palabras (español)
  // Patrones de precios en palabras con contexto monetario
  const priceInWordsPatterns = [
    // Número básico/compuesto + moneda (ej: "cien pesos", "mil dólares", "treinta y cinco pesos")
    /\b(uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce|trece|catorce|quince|dieciséis|dieciseis|diecisiete|dieciocho|diecinueve|veinte|veintiuno|veintidós|veintidos|veintitrés|veintitres|veinticuatro|veinticinco|veintiséis|veintiseis|veintisiete|veintiocho|veintinueve|treinta|cuarenta|cincuenta|sesenta|setenta|ochenta|noventa|cien|ciento|doscientos|doscientas|trescientos|trescientas|cuatrocientos|cuatrocientas|quinientos|quinientas|seiscientos|seiscientas|setecientos|setecientas|ochocientos|ochocientas|novecientos|novecientas|mil|dos mil|tres mil|cuatro mil|cinco mil|seis mil|siete mil|ocho mil|nueve mil|diez mil|veinte mil|treinta mil|cuarenta mil|cincuenta mil|sesenta mil|setenta mil|ochenta mil|noventa mil|cien mil|doscientos mil|trescientos mil|cuatrocientos mil|quinientos mil|seiscientos mil|setecientos mil|ochocientos mil|novecientos mil|millón|millones|un millón|dos millones|tres millones|cuatro millones|cinco millones|seis millones|siete millones|ocho millones|nueve millones|diez millones)\s+(pesos|dolares|dólares|dollar|dollars|euro|euros|cop|usd|eur)\b/gi,
    // Decenas compuestas + moneda (ej: "treinta y uno pesos", "cuarenta y cinco dólares")
    /\b(treinta|cuarenta|cincuenta|sesenta|setenta|ochenta|noventa)\s+y\s+(uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve)\s+(pesos|dolares|dólares|dollar|dollars|euro|euros|cop|usd|eur)\b/gi,
    // Precio/costo/valor + número en palabras + moneda (ej: "precio de cien pesos", "cuesta mil dólares")
    /\b(precio|cost[oa]|valor|pago|tarifa|honorario|honorarios|cuesta|cuestan|vale|valen|pagas|pagan|pago|pagos)\s+(de|es|son|un|una|el|la)?\s*(uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce|trece|catorce|quince|veinte|treinta|cuarenta|cincuenta|sesenta|setenta|ochenta|noventa|cien|ciento|doscientos|trescientos|cuatrocientos|quinientos|seiscientos|setecientos|ochocientos|novecientos|mil|dos mil|tres mil|cuatro mil|cinco mil|seis mil|siete mil|ocho mil|nueve mil|diez mil|veinte mil|treinta mil|cuarenta mil|cincuenta mil|sesenta mil|setenta mil|ochenta mil|noventa mil|cien mil|doscientos mil|trescientos mil|cuatrocientos mil|quinientos mil|seiscientos mil|setecientos mil|ochocientos mil|novecientos mil|millón|millones|un millón|dos millones|tres millones|cuatro millones|cinco millones|seis millones|siete millones|ocho millones|nueve millones|diez millones)\s*(pesos|dolares|dólares|dollar|dollars|euro|euros|cop|usd|eur)?\b/gi,
    // Precio/costo/valor + decenas compuestas + moneda (ej: "precio treinta y cinco pesos")
    /\b(precio|cost[oa]|valor|pago|tarifa|honorario|honorarios|cuesta|cuestan|vale|valen|pagas|pagan|pago|pagos)\s+(de|es|son|un|una|el|la)?\s*(treinta|cuarenta|cincuenta|sesenta|setenta|ochenta|noventa)\s+y\s+(uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve)\s*(pesos|dolares|dólares|dollar|dollars|euro|euros|cop|usd|eur)?\b/gi,
    // Combinaciones grandes: centenas + miles/millones + moneda (ej: "trescientos mil pesos", "dos millones de dólares")
    /\b(cien|ciento|doscientos|trescientos|cuatrocientos|quinientos|seiscientos|setecientos|ochocientos|novecientos)\s+(mil|millones?)\s*(de)?\s*(pesos|dolares|dólares|dollar|dollars|euro|euros|cop|usd|eur)?\b/gi,
    // Miles + moneda (ej: "mil pesos", "diez mil dólares")
    /\b(mil|dos mil|tres mil|cuatro mil|cinco mil|seis mil|siete mil|ocho mil|nueve mil|diez mil|veinte mil|treinta mil|cuarenta mil|cincuenta mil|sesenta mil|setenta mil|ochenta mil|noventa mil|cien mil|doscientos mil|trescientos mil|cuatrocientos mil|quinientos mil|seiscientos mil|setecientos mil|ochocientos mil|novecientos mil)\s+(pesos|dolares|dólares|dollar|dollars|euro|euros|cop|usd|eur)\b/gi,
    // Millones + moneda (ej: "un millón de pesos", "dos millones de dólares")
    /\b(millón|millones|un millón|dos millones|tres millones|cuatro millones|cinco millones|seis millones|siete millones|ocho millones|nueve millones|diez millones)\s+(de)?\s*(pesos|dolares|dólares|dollar|dollars|euro|euros|cop|usd|eur)\b/gi,
  ];

  // Verificar si hay números escritos en palabras con contexto monetario o de precio
  for (const pattern of priceInWordsPatterns) {
    if (pattern.test(text)) {
      // Verificar que no sea parte de una dirección o contexto permitido
      if (!hasAddressContext(text)) {
        return true;
      }
    }
  }

  // 4. Detectar números de identificación (cédula, NIT, etc.)
  // Patrones colombianos comunes (7-11 dígitos)
  // Nota: Los números de 6 dígitos ya están cubiertos en la sección de teléfonos
  const idPatterns = [
    /\b\d{7,11}\b/g, // Números largos sin contexto (posible cédula/NIT)
  ];

  // Solo marcar como sensible si NO está en contexto de dirección
  if (!hasAddressContext(text)) {
    for (const pattern of idPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        // Verificar que no sean números muy cortos (probablemente direcciones)
        const longNumbers = matches.filter(m => m.replace(/\D/g, '').length >= 7);
        if (longNumbers.length > 0) {
          console.log('[SENSITIVE DATA VALIDATOR] BLOQUEADO: Número de identificación detectado:', longNumbers);
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Mensaje de error estándar para mostrar al usuario
 */
export const SENSITIVE_DATA_ERROR_MESSAGE = 'No se permite compartir información sensible';

/**
 * Resultado de la validación de datos sensibles
 */
export interface SensitiveDataValidationResult {
  isBlocked: boolean;
  displayMessage: string;
  originalMessage: string;
}

/**
 * Valida información sensible y retorna el resultado con flag de bloqueado
 * @param text - Texto a validar
 * @returns Objeto con flag de bloqueado y mensaje a mostrar
 */
export function validateSensitiveData(text: string): SensitiveDataValidationResult {
  const originalMessage = text.trim();
  const isBlocked = containsSensitiveData(originalMessage);
  
  return {
    isBlocked,
    displayMessage: isBlocked ? SENSITIVE_DATA_ERROR_MESSAGE : originalMessage,
    originalMessage
  };
}

