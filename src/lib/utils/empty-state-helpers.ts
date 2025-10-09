// Helpers para manejar estados vacíos de manera consistente

export const emptyStates = {
  noServices: {
    title: 'No hay servicios disponibles',
    description: 'Aún no se han publicado servicios. Intenta de nuevo más tarde.',
    icon: '📭'
  },
  noApplications: {
    title: 'No hay postulaciones aún',
    description: 'Cuando alguien se postule a tu servicio, aparecerá aquí.',
    icon: '👥'
  },
  noBookings: {
    title: 'No tienes reservas',
    description: 'Tus reservas confirmadas aparecerán aquí.',
    icon: '📅'
  },
  noReviews: {
    title: 'Sin reseñas todavía',
    description: 'Las reseñas de los clientes aparecerán aquí.',
    icon: '⭐'
  },
  noWorkers: {
    title: 'No hay profesionales disponibles',
    description: 'No se encontraron profesionales que coincidan con tu búsqueda.',
    icon: '🔍'
  }
};

export const getEmptyState = (type: keyof typeof emptyStates) => emptyStates[type];

// Helper para verificar si un array está vacío y retornar el mensaje apropiado
export const handleEmptyArray = <T>(
  data: T[] | null | undefined,
  emptyType: keyof typeof emptyStates
) => {
  if (!data || data.length === 0) {
    return {
      isEmpty: true,
      emptyState: emptyStates[emptyType]
    };
  }
  return {
    isEmpty: false,
    data
  };
};

// Helper para formatear fechas de manera consistente
export const formatDate = (date: string) => {
  const d = new Date(date);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - d.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
  if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`;
  return `Hace ${Math.floor(diffDays / 365)} años`;
};

// Helper para formatear precios
export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(price);
};

// Helper para obtener el color del estado
export const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
    scheduled: 'bg-purple-100 text-purple-800',
    in_progress: 'bg-orange-100 text-orange-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    withdrawn: 'bg-gray-100 text-gray-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

// Helper para obtener el texto traducido del estado
export const getStatusText = (status: string) => {
  const translations: Record<string, string> = {
    active: 'Activo',
    pending: 'Pendiente',
    completed: 'Completado',
    cancelled: 'Cancelado',
    scheduled: 'Agendado',
    in_progress: 'En Progreso',
    accepted: 'Aceptado',
    rejected: 'Rechazado',
    withdrawn: 'Retirado',
    hired: 'Contratado'
  };
  return translations[status] || status;
};

