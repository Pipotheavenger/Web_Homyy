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
  const [imageError, setImageError] = useState(false);
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
      background: 'bg-gradient-to-b from-emerald-300 to-emerald-400',
      activeBackground: 'bg-white',
      text: 'text-gray-800',
      activeText: 'text-emerald-600',
      hover: 'hover:bg-white/10'
    }
  };

  const currentColors = sidebarColors[userType];

  return (
    <aside className={`${currentColors.background} shadow-lg transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-64'
    } min-h-screen`}>
      <div className={`relative ${collapsed ? 'p-2' : 'p-6'}`}>
        {/* Logo/Brand */}
        <div className={`flex items-center mb-6 ${collapsed ? 'flex-col space-y-2' : 'justify-between'}`}>
          <div className={`flex items-center ${collapsed ? 'flex-col' : 'space-x-3'}`}>
            <div className={`bg-white/20 rounded-xl flex items-center justify-center p-1 ${collapsed ? 'w-8 h-8' : 'w-10 h-10'}`}>
              {!imageError ? (
                <img
                  src="https://raw.githubusercontent.com/Pipotheavenger/Web_Homyy/master/public/Logo.svg" 
                  alt="Logo Hommy" 
                  width={collapsed ? 24 : 32} 
                  height={collapsed ? 24 : 32}
                  className="filter brightness-0 invert"
                  onError={() => setImageError(true)}
                  onLoad={() => setImageError(false)}
                />
              ) : (
                <span className={`text-white font-bold ${collapsed ? 'text-sm' : 'text-lg'}`}>H</span>
              )}
            </div>
            {!collapsed && (
              <div>
                <h2 className="text-lg font-bold text-white">
                  {userType === 'worker' ? (
                    <>
                      <span className="text-emerald-400">H</span>ommy
                    </>
                  ) : (
                    <>
                      <span className="text-emerald-400">H</span>ommy
                    </>
                  )}
                </h2>
                <p className="text-xs text-white">
                  {userType === 'worker' ? 'Profesional' : 'Cliente'}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 ${collapsed ? 'p-1' : 'p-2'}`}
          >
            <svg
              className={`transition-transform duration-300 ${collapsed ? 'w-3 h-3 rotate-180' : 'w-4 h-4'}`}
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
                     ? 'justify-center px-2 py-2' 
                     : 'space-x-3 px-4 py-3'
                 } rounded-xl ${
                   isActive
                     ? collapsed
                       ? 'bg-white/30 text-white'
                       : `${currentColors.activeBackground} ${currentColors.activeText} shadow-lg`
                     : `${currentColors.text} ${currentColors.hover}`
                 }`}
                title={collapsed ? item.label : undefined}
              >
                 <item.icon 
                   size={collapsed ? 18 : 20} 
                   className={
                     isActive 
                       ? collapsed
                         ? 'text-white'
                         : userType === 'worker' 
                           ? 'text-emerald-600' 
                           : 'text-[#743fc6]'
                       : 'text-white'
                   } 
                 />
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

      </div>
    </aside>
  );
}; 