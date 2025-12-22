import { UserType } from '@/contexts/UserTypeContext';
import { 
  LayoutDashboard, 
  Briefcase, 
  DollarSign, 
  User, 
  MessageCircle
} from 'lucide-react';

export interface NavigationItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  description: string;
}

export interface PageConfig {
  title: string;
  description: string;
  breadcrumbs: Array<{ label: string; href?: string; active?: boolean }>;
}

export const getNavigationItems = (userType: UserType): NavigationItem[] => {
  if (userType === 'worker') {
    return [
      {
        label: 'Dashboard',
        href: '/worker/dashboard',
        icon: LayoutDashboard,
        description: 'Panel principal del trabajador'
      },
      {
        label: 'Trabajos',
        href: '/worker/trabajos',
        icon: Briefcase,
        description: 'Buscar trabajos disponibles'
      },
      {
        label: 'Chats',
        href: '/worker/chats',
        icon: MessageCircle,
        description: 'Mensajes con clientes'
      },
      {
        label: 'Pagos',
        href: '/worker/pagos',
        icon: DollarSign,
        description: 'Gestionar pagos y balance'
      },
      {
        label: 'Perfil',
        href: '/worker/perfil',
        icon: User,
        description: 'Mi perfil profesional'
      }
    ];
  } else {
    return [
      {
        label: 'Mis Servicios',
        href: '/user/dashboard',
        icon: LayoutDashboard,
        description: 'Panel principal'
      },
      {
        label: 'Chats',
        href: '/user/chats',
        icon: MessageCircle,
        description: 'Mensajes y conversaciones'
      },
      {
        label: 'Pagos',
        href: '/user/pagos',
        icon: DollarSign,
        description: 'Gestionar pagos'
      },
      {
        label: 'Perfil',
        href: '/user/perfil',
        icon: User,
        description: 'Mi perfil'
      }
    ];
  }
};

export const getPageConfig = (userType: UserType, page: string): PageConfig => {
  const baseConfig = {
    user: {
      dashboard: {
        title: 'Dashboard',
        description: 'Panel principal de la aplicación',
        breadcrumbs: [{ label: 'Dashboard', active: true }]
      },
      chats: {
        title: 'Chats',
        description: 'Mensajes y conversaciones',
        breadcrumbs: [
          { label: 'Inicio', href: '/user/dashboard' },
          { label: 'Chats', active: true }
        ]
      },
      historial: {
        title: 'Historial',
        description: 'Revisa todas tus transacciones y movimientos',
        breadcrumbs: [
          { label: 'Inicio', href: '/user/dashboard' },
          { label: 'Historial', active: true }
        ]
      },
      perfil: {
        title: 'Mi Perfil',
        description: 'Gestiona tu información personal',
        breadcrumbs: [
          { label: 'Inicio', href: '/user/dashboard' },
          { label: 'Mi Perfil', active: true }
        ]
      },
      pagos: {
        title: 'Pagos y Balance',
        description: 'Gestiona tus pagos y balance',
        breadcrumbs: [
          { label: 'Inicio', href: '/user/dashboard' },
          { label: 'Pagos', active: true }
        ]
      }
    },
    worker: {
      dashboard: {
        title: 'Dashboard del Trabajador',
        description: 'Panel principal para profesionales',
        breadcrumbs: [{ label: 'Dashboard', active: true }]
      },
      chats: {
        title: 'Chats',
        description: 'Mensajes con clientes',
        breadcrumbs: [
          { label: 'Inicio', href: '/worker/dashboard' },
          { label: 'Chats', active: true }
        ]
      },
      historial: {
        title: 'Historial de Trabajos',
        description: 'Revisa todos tus trabajos y ganancias',
        breadcrumbs: [
          { label: 'Inicio', href: '/worker/dashboard' },
          { label: 'Historial', active: true }
        ]
      },
      perfil: {
        title: 'Mi Perfil Profesional',
        description: 'Gestiona tu perfil profesional',
        breadcrumbs: [
          { label: 'Inicio', href: '/worker/dashboard' },
          { label: 'Mi Perfil', active: true }
        ]
      },
      pagos: {
        title: 'Pagos y Ganancias',
        description: 'Gestiona tus ganancias y pagos',
        breadcrumbs: [
          { label: 'Inicio', href: '/worker/dashboard' },
          { label: 'Pagos', active: true }
        ]
      }
    }
  };

  const userConfig = baseConfig[userType] as Record<string, PageConfig>;
  return userConfig[page] || baseConfig[userType].dashboard;
};

export const getStatusConfig = (userType: UserType) => {
  if (userType === 'worker') {
    return {
      completado: {
        label: 'Completado',
        color: 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200',
        icon: '✅'
      },
      en_proceso: {
        label: 'En Progreso',
        color: 'bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 border-orange-200',
        icon: '⚡'
      },
      pendiente: {
        label: 'Pendiente',
        color: 'bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-700 border-yellow-200',
        icon: '⏳'
      },
      cancelado: {
        label: 'Cancelado',
        color: 'bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border-red-200',
        icon: '❌'
      },
      aplicado: {
        label: 'Aplicado',
        color: 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border-blue-200',
        icon: '📝'
      }
    };
  } else {
    return {
      completado: {
        label: 'Completado',
        color: 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200',
        icon: '✅'
      },
      en_proceso: {
        label: 'En Proceso',
        color: 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border-blue-200',
        icon: '⚡'
      },
      pendiente: {
        label: 'Pendiente',
        color: 'bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-700 border-yellow-200',
        icon: '⏳'
      },
      cancelado: {
        label: 'Cancelado',
        color: 'bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border-red-200',
        icon: '❌'
      },
      activo: {
        label: 'Activo',
        color: 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border-purple-200',
        icon: '🟢'
      }
    };
  }
}; 