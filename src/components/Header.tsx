'use client';
import { ArrowLeft, Menu } from 'lucide-react';
import { useUserType } from '@/contexts/UserTypeContext';
import { UserType } from '@/contexts/UserTypeContext';

interface HeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Array<{ label: string; href?: string; active?: boolean }>;
  showBackButton?: boolean;
  onBackClick?: () => void;
  userType: UserType;
  colors: any;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  description,
  breadcrumbs = [],
  showBackButton = false,
  onBackClick,
  userType,
  colors
}) => {
  return (
    <header className={`${colors.card} border-b ${colors.border} shadow-sm`}>
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
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

          {/* Breadcrumbs */}
          {breadcrumbs.length > 0 && (
            <nav className="hidden md:flex items-center space-x-2">
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
        </div>
      </div>
    </header>
  );
}; 