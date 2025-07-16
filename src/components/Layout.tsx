'use client';
import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  breadcrumbs?: Array<{ label: string; href?: string; active?: boolean }>;
  showBackButton?: boolean;
  onBackClick?: () => void;
  currentPage?: string;
}

export default function Layout({ 
  children, 
  title, 
  breadcrumbs = [], 
  showBackButton = false,
  onBackClick,
  currentPage = ''
}: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar sidebarCollapsed={sidebarCollapsed} currentPage={currentPage} />

      {/* Main Content */}
      <div className={`transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        {/* Header */}
        <Header 
          title={title}
          breadcrumbs={breadcrumbs}
          showBackButton={showBackButton}
          onBackClick={onBackClick}
          onMenuClick={toggleSidebar}
        />

        {/* Content */}
        {children}
      </div>
    </div>
  );
} 