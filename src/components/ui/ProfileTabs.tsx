import { User, Award, Settings, Star } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
}

interface ProfileTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  userType?: 'user' | 'worker';
}

export const ProfileTabs = ({ activeTab, onTabChange, userType = 'user' }: ProfileTabsProps) => {
  const baseTabs: Tab[] = [
    { id: 'informacion', label: 'Información Personal', icon: User },
    { id: 'servicios', label: userType === 'worker' ? 'Mis Trabajos' : 'Mis Servicios', icon: Award },
    { id: 'reseñas', label: 'Mis Reseñas', icon: Star }
  ];

  // No mostrar preferencias para nadie por ahora
  const tabs = baseTabs;

  return (
    <div className="flex space-x-1 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
            activeTab === tab.id
              ? 'bg-[#743fc6] text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <tab.icon size={16} />
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}; 