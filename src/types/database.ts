// =====================================================
// TIPOS DE BASE DE DATOS PARA HOMMY
// =====================================================

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  created_at: string;
}

export interface Service {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category_id: string | null;
  location: string | null;
  status: string; // varchar(50) según el esquema
  created_at: string;
  updated_at: string;
  // Relaciones
  category?: Category;
  schedules?: ServiceSchedule[];
}

export interface ServiceSchedule {
  id: string;
  service_id: string;
  date_available: string; // YYYY-MM-DD según el esquema
  start_time: string;
  end_time: string;
  created_at: string;
}

export interface Professional {
  id: string;
  user_id: string;
  name: string;
  specialty: string | null;
  experience_years: number | null;
  rating: number;
  total_services: number;
  location: string | null;
  bio: string | null;
  hourly_rate: number | null;
  is_verified: boolean;
  is_online: boolean;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  service_id: string;
  reviewer_id: string;
  professional_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  // Relaciones
  reviewer?: {
    id: string;
    email: string;
  };
  professional?: Professional;
}

export interface Transaction {
  id: string;
  user_id: string;
  service_id: string | null;
  professional_id: string | null;
  amount: number;
  type: 'payment' | 'refund' | 'commission' | 'withdrawal';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string | null;
  created_at: string;
  // Relaciones
  service?: Service;
  professional?: Professional;
}

// =====================================================
// TIPOS PARA FORMULARIOS
// =====================================================

export interface CreateServiceData {
  title: string;
  description?: string;
  category_id: string;
  location?: string;
  status?: string;
  schedules?: {
    date: string; // YYYY-MM-DD - se mapea a date_available en la BD
    start_time: string; // HH:MM
    end_time: string; // HH:MM
  }[];
}

export interface UpdateServiceData extends Partial<CreateServiceData> {
  status?: 'contratando' | 'eligiendo' | 'contratado' | 'completado';
}

export interface CreateProfessionalData {
  name: string;
  specialty?: string;
  experience_years?: number;
  location?: string;
  bio?: string;
  hourly_rate?: number;
}

export interface CreateReviewData {
  service_id: string;
  professional_id: string;
  rating: number;
  comment?: string;
}

// =====================================================
// TIPOS PARA FILTROS Y BÚSQUEDA
// =====================================================

export interface ServiceFilters {
  category_id?: string;
  status?: 'contratando' | 'eligiendo' | 'contratado' | 'completado';
  location?: string;
  price_min?: number;
  price_max?: number;
}

export interface ProfessionalFilters {
  specialty?: string;
  location?: string;
  is_online?: boolean;
  is_verified?: boolean;
  rating_min?: number;
  hourly_rate_max?: number;
}

// =====================================================
// TIPOS PARA ESTADÍSTICAS
// =====================================================

export interface ServiceStats {
  total_services: number;
  active_services: number;
  total_earnings: number;
  average_rating: number;
  total_reviews: number;
}

export interface DashboardStats {
  services: ServiceStats;
  recent_services: Service[];
  recent_transactions: Transaction[];
  top_categories: {
    category: Category;
    count: number;
  }[];
}

// =====================================================
// TIPOS PARA API RESPONSES
// =====================================================

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// =====================================================
// TIPOS PARA NOTIFICACIONES
// =====================================================

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'service' | 'payment' | 'system' | 'promotion' | 'reminder';
  is_read: boolean;
  is_important: boolean;
  created_at: string;
  action_url?: string;
}

// =====================================================
// TIPOS PARA CHAT
// =====================================================

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  message: string;
  message_type: 'text' | 'image' | 'document';
  is_read: boolean;
  created_at: string;
}

export interface ChatConversation {
  id: string;
  user_id: string;
  professional_id: string;
  service_id: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  created_at: string;
  // Relaciones
  professional?: Professional;
  service?: Service;
} 