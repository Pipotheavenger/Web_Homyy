import { Star as StarIcon } from 'lucide-react';

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(price);
};

export const renderStars = (rating: number) => {
  return Array.from({ length: 5 }, (_, i) => (
    <StarIcon
      key={i}
      size={16}
      className={`${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
    />
  ));
};

export const getEstadoColor = (estado: string) => {
  switch (estado) {
    case 'aprobado':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'rechazado':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  }
};

export const getEstadoText = (estado: string) => {
  switch (estado) {
    case 'aprobado':
      return 'Aprobado';
    case 'rechazado':
      return 'Rechazado';
    default:
      return 'Pendiente';
  }
};

// =====================================================
// FUNCIONES DE CAPITALIZACIÓN
// =====================================================

/**
 * Capitaliza la primera letra de cada palabra en un texto
 * @param text - Texto a capitalizar
 * @returns Texto con la primera letra de cada palabra en mayúscula
 */
export const capitalizeText = (text: string): string => {
  if (!text || typeof text !== 'string') return text;
  
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Capitaliza solo la primera letra del texto
 * @param text - Texto a capitalizar
 * @returns Texto con solo la primera letra en mayúscula
 */
export const capitalizeFirstLetter = (text: string): string => {
  if (!text || typeof text !== 'string') return text;
  
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Capitaliza nombres propios (mantiene algunas palabras en minúsculas)
 * @param text - Texto a capitalizar
 * @returns Texto capitalizado respetando artículos y preposiciones
 */
export const capitalizeProperName = (text: string): string => {
  if (!text || typeof text !== 'string') return text;
  
  const articles = ['el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'de', 'del', 'en', 'con', 'por', 'para', 'y', 'o'];
  
  return text
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      // La primera palabra siempre se capitaliza
      if (index === 0) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      
      // Las palabras que están en la lista de artículos se mantienen en minúsculas
      if (articles.includes(word)) {
        return word;
      }
      
      // El resto se capitaliza
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};

/**
 * Hook para capitalizar automáticamente inputs
 * @param value - Valor del input
 * @param type - Tipo de capitalización ('all', 'first', 'proper')
 * @returns Valor capitalizado
 */
export const useCapitalize = (value: string, type: 'all' | 'first' | 'proper' = 'all'): string => {
  if (!value) return value;
  
  switch (type) {
    case 'first':
      return capitalizeFirstLetter(value);
    case 'proper':
      return capitalizeProperName(value);
    case 'all':
    default:
      return capitalizeText(value);
  }
}; 