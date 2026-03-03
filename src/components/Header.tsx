'use client';
import { useState } from 'react';
import { ArrowLeft, Menu } from 'lucide-react';
import { useUserType } from '@/contexts/UserTypeContext';
import { UserType } from '@/contexts/UserTypeContext';
import { NotificationBell } from '@/components/ui/NotificationBell';
import { MobileMenu } from '@/components/ui/MobileMenu';
import { NavigationItem } from '@/utils/userTypeUtils';
import { ASSETS_CONFIG } from '@/lib/assets-config';
import { type NotificationCounts } from '@/hooks/useNotificationCounts';

interface HeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Array<{ label: string; href?: string; active?: boolean }>;
  showBackButton?: boolean;
  onBackClick?: () => void;
  userType: UserType;
  colors: any;
  showNotifications?: boolean;
  navigationItems?: NavigationItem[];
  currentPage?: string;
  counts?: NotificationCounts;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  description,
  breadcrumbs = [],
  showBackButton = false,
  onBackClick,
  userType,
  colors,
  showNotifications = true,
  navigationItems = [],
  currentPage = 'dashboard',
  counts
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className={`${colors.card} border-b ${colors.border} shadow-sm`}>
        <div className="px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Móvil: Menú hamburguesa a la izquierda */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Abrir menú"
              >
                <Menu size={24} className="text-gray-700" />
              </button>
            </div>

            {/* Móvil: Logo Hommy centrado */}
            <div className="md:hidden flex-1 flex justify-center">
              <div className="flex items-center space-x-2">
                <div className={`${userType === 'worker' ? 'bg-emerald-500/20' : 'bg-purple-500/20'} rounded-lg flex items-center justify-center p-1.5`}>
                  <img
                    src={ASSETS_CONFIG.logo.svg} 
                    alt="Logo Hommy" 
                    width={24} 
                    height={24}
                    className="filter brightness-0"
                  />
                </div>
                <h2 className="text-lg font-bold text-gray-800">
                  <span className="text-emerald-400">H</span>ommy
                </h2>
              </div>
            </div>

            {/* Desktop: Botón atrás y título */}
            <div className="hidden md:flex items-center space-x-4 flex-1">
              {showBackButton && (
                <button
                  onClick={onBackClick}
                  className={`p-2 rounded-full ${userType === 'worker' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-purple-500 hover:bg-purple-600'} text-white transition-all duration-300 shadow-sm hover:shadow-md`}
                  title="Regresar"
                >
                  <ArrowLeft size={18} />
                </button>
              )}
              
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
                {description && (
                  <p className="text-gray-600 text-sm mt-1">{description}</p>
                )}
              </div>
            </div>

            {/* Sección derecha: Breadcrumbs + Notificaciones */}
            <div className="flex items-center gap-3 md:gap-4">
              {/* Breadcrumbs solo en desktop */}
              {breadcrumbs.length > 0 && (
                <nav className="hidden lg:flex items-center space-x-2">
                  {breadcrumbs.map((crumb, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      {index > 0 && (
                        <span className="text-gray-400">/</span>
                      )}
                      {crumb.href ? (
                        <a
                          href={crumb.href}
                          className={`text-sm ${crumb.active ? colors.text : 'text-gray-600 hover:text-gray-800'} transition-colors`}
                        >
                          {crumb.label}
                        </a>
                      ) : (
                        <span className={`text-sm ${crumb.active ? colors.text : 'text-gray-600'}`}>
                          {crumb.label}
                        </span>
                      )}
                    </div>
                  ))}
                </nav>
              )}

              {/* Campana de notificaciones */}
              {showNotifications && <NotificationBell />}
            </div>
          </div>
        </div>
      </header>

      {/* Indicador de página actual - Solo en móvil */}
      <div className="md:hidden bg-white border-b border-gray-200">
        <div className="px-4 py-1.5">
          <h2 className="text-sm font-semibold text-gray-600 text-center">
            {title}
          </h2>
        </div>
      </div>

      {/* Menú móvil */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navigationItems={navigationItems}
        currentPage={currentPage}
        userType={userType}
        colors={colors}
        counts={counts}
      />
    </>
  );
}; 