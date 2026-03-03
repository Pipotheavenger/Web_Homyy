'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { X, LogOut } from 'lucide-react';
import { UserType } from '@/contexts/UserTypeContext';
import { NavigationItem } from '@/utils/userTypeUtils';
import { supabase } from '@/lib/supabase';
import { type NotificationCounts } from '@/hooks/useNotificationCounts';
import { ASSETS_CONFIG } from '@/lib/assets-config';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navigationItems: NavigationItem[];
  currentPage: string;
  userType: UserType;
  colors: any;
  counts?: NotificationCounts;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  navigationItems,
  currentPage,
  userType,
  colors,
  counts
}) => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Prevenir scroll del body cuando el menú está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Función para obtener el badge según la ruta
  const getBadgeCount = (href: string) => {
    if (!counts) return 0;
    if (href.includes('chats')) return counts.unreadMessages;
    if (href.includes('pagos')) return counts.pendingPayments;
    if (href.includes('dashboard') && userType === 'user') return counts.newApplications;
    if (href.includes('trabajos') && userType === 'worker') return counts.newApplications;
    return 0;
  };

  const handleNavigation = (href: string) => {
    router.push(href);
    onClose();
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error al cerrar sesión:', error);
        alert('Error al cerrar sesión. Por favor, intenta de nuevo.');
      } else {
        localStorage.removeItem('userType');
        router.push('/login');
      }
    } catch (error) {
      console.error('Error inesperado al cerrar sesión:', error);
      alert('Error inesperado. Por favor, intenta de nuevo.');
    }
  };

  // Colores específicos para el menú móvil
  const menuColors = {
    user: {
      background: 'bg-gradient-to-b from-[#743fc6] to-[#8a5fd1]',
      activeBackground: 'bg-white',
      text: 'text-white',
      activeText: 'text-[#743fc6]',
      hover: 'hover:bg-white/10'
    },
    worker: {
      background: 'bg-gradient-to-b from-emerald-300 to-emerald-400',
      activeBackground: 'bg-white',
      text: 'text-gray-800',
      activeText: 'text-emerald-600',
      hover: 'hover:bg-white/10'
    }
  };

  const currentColors = menuColors[userType];

  if (!isOpen || !mounted) return null;

  const menuContent = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
        onClick={onClose}
      />

      {/* Menú */}
      <div
        className={`fixed left-0 top-0 bottom-0 w-[85vw] max-w-80 ${currentColors.background} shadow-2xl z-[9999] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header del menú */}
        <div className="p-6 border-b border-white/20 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 rounded-xl flex items-center justify-center p-2 w-10 h-10">
                <img
                  src={ASSETS_CONFIG.logo.svg}
                  alt="Logo Hommy"
                  width={28}
                  height={28}
                  className="filter brightness-0 invert"
                />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  <span className="text-emerald-400">H</span>ommy
                </h2>
                <p className="text-xs text-white/80">
                  {userType === 'worker' ? 'Profesional' : 'Cliente'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors"
              aria-label="Cerrar menú"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
          {navigationItems.map((item) => {
            const itemPath = item.href.split('/').pop();
            const isActive =
              currentPage === itemPath ||
              (currentPage === 'chats' && itemPath === 'chats') ||
              (currentPage === 'dashboard' && itemPath === 'dashboard') ||
              (currentPage === 'pagos' && itemPath === 'pagos') ||
              (currentPage === 'perfil' && itemPath === 'perfil') ||
              (currentPage === 'trabajos' && itemPath === 'trabajos');

            const badgeCount = getBadgeCount(item.href);

            return (
              <button
                key={item.href}
                onClick={() => handleNavigation(item.href)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? `${currentColors.activeBackground} ${currentColors.activeText} shadow-lg`
                    : `${currentColors.text} ${currentColors.hover}`
                }`}
              >
                <item.icon
                  size={20}
                  className={
                    isActive
                      ? userType === 'worker'
                        ? 'text-emerald-600'
                        : 'text-[#743fc6]'
                      : 'text-white'
                  }
                />
                <div className="flex-1 text-left flex items-center justify-between">
                  <div>
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs opacity-75">{item.description}</div>
                  </div>
                  {badgeCount > 0 && (
                    <span className="flex-shrink-0 ml-2 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                      {badgeCount > 99 ? '99+' : badgeCount}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Botón de Cerrar Sesión */}
        <div className="p-4 border-t border-white/20">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${currentColors.text} ${currentColors.hover} hover:bg-red-500/20 group`}
          >
            <LogOut
              size={20}
              className="text-white group-hover:text-red-300 transition-colors"
            />
            <div className="flex-1 text-left">
              <div className="font-medium group-hover:text-red-300 transition-colors">
                Cerrar Sesión
              </div>
              <div className="text-xs opacity-75">Salir de tu cuenta</div>
            </div>
          </button>
        </div>
      </div>
    </>
  );

  return createPortal(menuContent, document.body);
};

