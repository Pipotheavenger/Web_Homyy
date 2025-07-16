'use client';
import { 
  Briefcase, 
  User, 
  Settings, 
  LogOut, 
  MessageCircle,
  CreditCard,
  History,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  sidebarCollapsed: boolean;
  currentPage?: string;
}

export default function Sidebar({ sidebarCollapsed, currentPage = '' }: SidebarProps) {
  const navigationItems = [
    {
      href: '/dashboard',
      icon: Briefcase,
      label: 'Mis Servicios',
      active: currentPage === 'dashboard'
    },
    {
      href: '/chats',
      icon: MessageCircle,
      label: 'Chat',
      active: currentPage === 'chats'
    },
    {
      href: '/pagos',
      icon: CreditCard,
      label: 'Pagos',
      active: currentPage === 'pagos'
    },
    {
      href: '/historial',
      icon: History,
      label: 'Historial',
      active: currentPage === 'historial'
    },
    {
      href: '/perfil',
      icon: User,
      label: 'Perfil',
      active: currentPage === 'perfil'
    },
    {
      href: '#',
      icon: Settings,
      label: 'Configuración',
      active: false
    }
  ];

  return (
    <div className={`fixed top-0 left-0 h-full bg-gradient-to-b from-[#743fc6] to-[#8a5fd1] text-white transition-all duration-300 ease-in-out z-50 ${
      sidebarCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-4 border-b border-purple-400/30">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-[#fbbc6c] rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            {!sidebarCollapsed && (
              <h2 className="text-xl font-bold">Hommy</h2>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item, index) => (
            <a 
              key={index}
              href={item.href}
              className={`flex items-center justify-center md:justify-start p-3 rounded-lg transition-all duration-200 transform hover:scale-105 ${
                item.active 
                  ? 'bg-white/20 hover:bg-white/30' 
                  : 'hover:bg-white/20'
              }`}
            >
              <item.icon size={24} className="md:w-5 md:h-5" />
              {!sidebarCollapsed && <span className="ml-3">{item.label}</span>}
            </a>
          ))}
        </nav>

        {/* Premium CTA */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-white/20">
            <div className="bg-white/10 border border-white/20 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-2">
                    <span className="text-white text-sm">💼</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium">¡Usa nuestras</p>
                    <p className="text-xs font-medium">funciones Premium!</p>
                  </div>
                </div>
                <ChevronRight size={16} />
              </div>
            </div>
          </div>
        )}

        {/* Logout */}
        <div className="p-4 border-t border-white/20">
          <button className="flex items-center justify-center md:justify-start p-3 rounded-lg hover:bg-white/20 transition-all duration-200 transform hover:scale-105 w-full">
            <LogOut size={24} className="md:w-5 md:h-5" />
            {!sidebarCollapsed && <span className="ml-3">Cerrar sesión</span>}
          </button>
        </div>
      </div>
    </div>
  );
} 