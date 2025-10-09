'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserType } from '@/contexts/UserTypeContext';
import { UserType } from '@/contexts/UserTypeContext';
import { NavigationItem } from '@/utils/userTypeUtils';

interface SidebarProps {
  navigationItems: NavigationItem[];
  currentPage: string;
  userType: UserType;
  colors: any;
}

export const Sidebar: React.FC<SidebarProps> = ({
  navigationItems,
  currentPage,
  userType,
  colors
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  // Colores específicos para el sidebar
  const sidebarColors = {
    user: {
      background: 'bg-gradient-to-b from-[#743fc6] to-[#8a5fd1]',
      activeBackground: 'bg-white',
      text: 'text-white',
      activeText: 'text-[#743fc6]',
      hover: 'hover:bg-white/10'
    },
    worker: {
      background: 'bg-gradient-to-b from-orange-300 to-orange-400',
      activeBackground: 'bg-white',
      text: 'text-white',
      activeText: 'text-orange-400',
      hover: 'hover:bg-white/10'
    }
  };

  const currentColors = sidebarColors[userType];

  return (
    <aside className={`${currentColors.background} shadow-lg transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-64'
    } min-h-screen`}>
      <div className="p-6">
        {/* Logo/Brand */}
        <div className="flex items-center justify-between mb-8">
          {!collapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {userType === 'worker' ? 'W' : 'H'}
                </span>
              </div>
              <div>
                                 <h2 className="text-lg font-bold text-white">
                   {userType === 'worker' ? (
                     <>
                       <span className="text-orange-400">H</span>ommy
                     </>
                   ) : (
                     <>
                       <span className="text-orange-400">H</span>ommy
                     </>
                   )}
                 </h2>
                <p className="text-xs text-white/80">
                  {userType === 'worker' ? 'Profesional' : 'Cliente'}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
          >
            <svg
              className={`w-4 h-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            // Mejorar la detección de página activa
            const itemPath = item.href.split('/').pop();
            const isActive = currentPage === itemPath || 
                           (currentPage === 'chats' && itemPath === 'chats') ||
                           (currentPage === 'dashboard' && itemPath === 'dashboard') ||
                           (currentPage === 'pagos' && itemPath === 'pagos') ||
                           (currentPage === 'perfil' && itemPath === 'perfil') ||
                           (currentPage === 'trabajos' && itemPath === 'trabajos');
            
            return (
              <button
                key={item.href}
                onClick={() => handleNavigation(item.href)}
                className={`w-full flex items-center transition-all duration-300 ${
                  collapsed 
                    ? 'justify-center px-3 py-3' 
                    : 'space-x-3 px-4 py-3'
                } rounded-xl ${
                  isActive
                    ? collapsed
                      ? `${currentColors.text} bg-white/20`
                      : `${currentColors.activeBackground} ${currentColors.activeText} shadow-lg`
                    : `${currentColors.text} ${currentColors.hover}`
                }`}
                title={collapsed ? item.label : undefined}
              >
                <span className="text-lg">{item.icon}</span>
                {!collapsed && (
                  <div className="flex-1 text-left">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs opacity-75">{item.description}</div>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Info */}
        {!collapsed && (
          <div className="mt-8 pt-6 border-t border-white/20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">
                  {userType === 'worker' ? 'T' : 'U'}
                </span>
              </div>
              <div>
                <p className="font-medium text-white">
                  {userType === 'worker' ? 'Trabajador' : 'Usuario'}
                </p>
                <p className="text-xs text-white/80">
                  {userType === 'worker' ? 'Profesional' : 'Cliente'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}; 