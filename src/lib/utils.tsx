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