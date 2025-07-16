'use client';
import { 
  Menu,
  Search,
  Mail,
  Bell,
  ArrowLeft
} from 'lucide-react';

interface HeaderProps {
  title: string;
  breadcrumbs?: Array<{ label: string; href?: string; active?: boolean }>;
  showBackButton?: boolean;
  onBackClick?: () => void;
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export default function Header({ 
  title, 
  breadcrumbs = [], 
  showBackButton = false,
  onBackClick,
  onMenuClick,
  showMenuButton = true
}: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-4">
          {showMenuButton && (
            <button
              onClick={onMenuClick}
              className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
            >
              <Menu size={24} />
            </button>
          )}
          {showBackButton && (
            <button
              onClick={onBackClick}
              className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
          )}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{title}</h1>
            {breadcrumbs.length > 0 && (
              <nav className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                {breadcrumbs.map((crumb, index) => (
                  <span key={index}>
                    {index > 0 && <span className="mx-2">›</span>}
                    {crumb.active ? (
                      <span className="text-[#743fc6]">{crumb.label}</span>
                    ) : crumb.href ? (
                      <a href={crumb.href} className="hover:text-[#743fc6] transition-colors">
                        {crumb.label}
                      </a>
                    ) : (
                      <span>{crumb.label}</span>
                    )}
                  </span>
                ))}
              </nav>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-lg hover:bg-gray-100">
            <Search size={20} className="text-gray-600" />
          </button>
          <button className="p-2 rounded-lg hover:bg-gray-100">
            <Mail size={20} className="text-gray-600" />
          </button>
          <button className="p-2 rounded-lg hover:bg-gray-100">
            <Bell size={20} className="text-gray-600" />
          </button>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Usuario</span>
            <div className="w-8 h-8 bg-gradient-to-r from-[#743fc6] to-[#8a5fd1] rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">U</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 