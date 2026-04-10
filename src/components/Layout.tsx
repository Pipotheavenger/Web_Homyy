'use client';
import { ReactNode } from 'react';
import { useUserType } from '@/contexts/UserTypeContext';
import { getNavigationItems, getPageConfig } from '@/utils/userTypeUtils';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useChatUnreadCount } from '@/hooks/useChatUnreadCount';
import { useNotificationCounts } from '@/hooks/useNotificationCounts';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  breadcrumbs?: Array<{ label: string; href?: string; active?: boolean }>;
  showBackButton?: boolean;
  onBackClick?: () => void;
  currentPage?: string;
}

export default function Layout({
  children,
  title,
  description,
  breadcrumbs,
  showBackButton = false,
  onBackClick,
  currentPage = 'dashboard'
}: LayoutProps) {
  const { userType, colors } = useUserType();
  const navigationItems = getNavigationItems(userType);
  const pageConfig = getPageConfig(userType, currentPage);
  const unreadMessages = useChatUnreadCount();
  const counts = useNotificationCounts({ externalUnreadMessages: unreadMessages });

  const finalTitle = title || pageConfig.title;
  const finalDescription = description || pageConfig.description;
  const finalBreadcrumbs = breadcrumbs || pageConfig.breadcrumbs;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex md:relative">
        {/* Sidebar - Oculto en móvil */}
        <div className="hidden md:block md:sticky md:top-0 md:self-start md:h-screen md:flex-shrink-0">
          <Sidebar
            navigationItems={navigationItems}
            currentPage={currentPage}
            userType={userType}
            colors={colors}
            counts={counts}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col w-full md:w-auto min-w-0 overflow-x-hidden min-h-screen">
          {/* Header - Siempre visible con campana de notificaciones */}
          <Header
            title={finalTitle}
            description={finalDescription}
            breadcrumbs={finalBreadcrumbs}
            showBackButton={showBackButton}
            onBackClick={onBackClick}
            userType={userType}
            colors={colors}
            showNotifications={true}
            navigationItems={navigationItems}
            currentPage={currentPage}
            counts={counts}
          />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
} 