// =====================================================
// TIPOS DE BASE DE DATOS PARA HOMMY
// =====================================================

// Constantes de estado para evitar strings literales dispersos
export const APPLICATION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
} as const;
export type ApplicationStatus = typeof APPLICATION_STATUS[keyof typeof APPLICATION_STATUS];

export const SERVICE_STATUS = {
  ACTIVE: 'active',
  CONTRATANDO: 'contratando',
  ELIGIENDO: 'eligiendo',
  CONTRATADO: 'contratado',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  DELETED: 'deleted',
  CANCELLED: 'cancelled',
} as const;
export type ServiceStatus = typeof SERVICE_STATUS[keyof typeof SERVICE_STATUS];

export interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  user_type: 'user' | 'worker';
  phone: string | null;
  birth_date: string | null;
  profile_picture_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkerProfile {
  id: string;
  user_id: string;
  profession: string;
  experience_years: number;
  bio: string | null;
  profile_description: string | null;
  categories: string[];
  certifications: string[];
  hourly_rate: number | null;
  rating: number;
  total_services: number;
  is_verified: boolean;
  is_available: boolean;
  location: string | null;
  created_at: string;
  updated_at: string;
}

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
  status: ServiceStatus;
  images?: string[]; // Array de URLs de imágenes
  created_at: string;
  updated_at: string;
  // Campos para el sistema de escrow y PIN
  completion_pin?: string;
  pin_generated_at?: string;
  escrow_amount?: number;
  worker_final_amount?: number;
  // Campo para mostrar el monto en la UI
  budget?: number;
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
    name?: string | null;
    phone?: string | null;
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

export interface RegisterUserData {
  fullName: string;
  phone: string;
  birthDate: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterWorkerData extends RegisterUserData {
  profession: string;
  experienceYears: number;
  selectedCategories: string[];
  profileDescription: string;
  certifications?: string[];
}

export interface CreateServiceData {
  title: string;
  description?: string;
  category_id: string;
  location?: string;
  status?: string;
  images?: string[]; // Array de URLs de imágenes (máximo 5)
  schedules?: {
    date: string; // YYYY-MM-DD - se mapea a date_available en la BD
    start_time: string; // HH:MM
    end_time: string; // HH:MM
  }[];
}

export interface UpdateServiceData extends Partial<CreateServiceData> {
  status?: 'contratando' | 'eligiendo' | 'contratado' | 'completed' | 'cancelled';
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
  status?: 'contratando' | 'eligiendo' | 'contratado' | 'completed' | 'cancelled';
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
  count?: number;
}

// =====================================================
// TIPOS PARA COMPONENTES UI
// =====================================================

export interface RegisterStep {
  id: string;
  title: string;
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