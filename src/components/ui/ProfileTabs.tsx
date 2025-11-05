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
    <div className="flex flex-col lg:flex-row space-y-1 lg:space-y-0 lg:space-x-1 mb-4 lg:mb-6 w-full max-w-full overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center justify-center lg:justify-start space-x-2 px-3 lg:px-4 py-2 rounded-lg transition-all duration-200 text-sm lg:text-base w-full lg:w-auto flex-shrink-0 ${
            activeTab === tab.id
              ? userType === 'worker' ? 'bg-green-600 text-white' : 'bg-[#743fc6] text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <tab.icon size={16} className="flex-shrink-0" />
          <span className="break-words text-center lg:text-left">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}; 