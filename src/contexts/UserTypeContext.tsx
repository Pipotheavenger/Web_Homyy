'use client';
import React, { createContext, useContext, ReactNode } from 'react';

export type UserType = 'user' | 'worker';

interface UserTypeContextType {
  userType: UserType;
  setUserType: (type: UserType) => void;
  colors: {
    primary: string;
    secondary: string;
    gradient: string;
    gradientHover: string;
    background: string;
    card: string;
    border: string;
    text: string;
    textSecondary: string;
  };
}

const UserTypeContext = createContext<UserTypeContextType | undefined>(undefined);

interface UserTypeProviderProps {
  children: ReactNode;
  initialUserType?: UserType;
}

export const UserTypeProvider: React.FC<UserTypeProviderProps> = ({ 
  children, 
  initialUserType = 'user' 
}) => {
  const [userType, setUserType] = React.useState<UserType>(initialUserType);

  const colors = React.useMemo(() => {
    if (userType === 'worker') {
      return {
        primary: 'from-emerald-300 to-emerald-400',
        secondary: 'from-emerald-400 to-emerald-500',
        gradient: 'bg-gradient-to-r from-emerald-300 to-emerald-400',
        gradientHover: 'hover:from-emerald-400 hover:to-emerald-500',
        background: 'bg-gradient-to-r from-emerald-50/80 to-emerald-100/80',
        card: 'bg-white/95 backdrop-blur-md',
        border: 'border-emerald-200/30',
        text: 'text-emerald-700',
        textSecondary: 'text-emerald-600'
      };
    } else {
      return {
        primary: 'from-purple-500 to-pink-500',
        secondary: 'from-purple-600 to-pink-600',
        gradient: 'bg-gradient-to-r from-purple-500 to-pink-500',
        gradientHover: 'hover:from-purple-600 hover:to-pink-600',
        background: 'bg-gradient-to-r from-purple-50/80 via-pink-50/80 to-blue-50/80',
        card: 'bg-white/95 backdrop-blur-md',
        border: 'border-purple-200/30',
        text: 'text-purple-700',
        textSecondary: 'text-pink-600'
      };
    }
  }, [userType]);

  const value = {
    userType,
    setUserType,
    colors
  };

  return (
    <UserTypeContext.Provider value={value}>
      {children}
    </UserTypeContext.Provider>
  );
};

export const useUserType = (): UserTypeContextType => {
  const context = useContext(UserTypeContext);
  if (context === undefined) {
    throw new Error('useUserType must be used within a UserTypeProvider');
  }
  return context;
}; 