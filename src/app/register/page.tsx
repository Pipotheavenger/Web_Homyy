'use client';
import { useState } from 'react';
import { LoginHeader } from '@/components/ui/LoginHeader';
import RoleSelection from '@/components/ui/RoleSelection';
import WorkerInfoForm from '@/components/ui/WorkerInfoForm';
import PersonalDataForm from '@/components/ui/PersonalDataForm';
import RegisterSuccess from '@/components/ui/RegisterSuccess';
import BgWave from '../login/BgWave';
import { useRegister } from '@/hooks/useRegister';
import { RegisterUserData, RegisterWorkerData } from '@/types/database';

type RegistrationStep = 'role' | 'worker-info' | 'personal-data' | 'success';
type UserRole = 'user' | 'worker';

interface WorkerInfoData {
  profession: string;
  certifications: string[];
  experienceYears: string;
  categories: string[];
  bio: string;
}

interface PersonalData {
  fullName: string;
  email: string;
  phone: string;
  birthDate: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('role');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [workerInfo, setWorkerInfo] = useState<WorkerInfoData | null>(null);
  const { isLoading, error, registerUser, registerWorker, clearError } = useRegister();

  // Funciones de navegación
  const handleRoleSelection = (role: UserRole) => {
    setSelectedRole(role);
    if (role === 'user') {
      setCurrentStep('personal-data');
    } else {
      setCurrentStep('worker-info');
    }
  };

  const handleWorkerInfoSubmit = (data: WorkerInfoData) => {
    setWorkerInfo(data);
    setCurrentStep('personal-data');
  };

  const handlePersonalDataSubmit = async (data: PersonalData) => {
    if (!selectedRole) return;

    clearError();

    try {
      let result;

      if (selectedRole === 'user') {
        const userData: RegisterUserData = {
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          birthDate: data.birthDate,
          password: data.password,
          confirmPassword: data.confirmPassword
        };

        result = await registerUser(userData);
      } else if (selectedRole === 'worker' && workerInfo) {
        const workerData: RegisterWorkerData = {
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          birthDate: data.birthDate,
          password: data.password,
          confirmPassword: data.confirmPassword,
          profession: workerInfo.profession,
          experienceYears: parseInt(workerInfo.experienceYears),
          selectedCategories: workerInfo.categories,
          profileDescription: workerInfo.bio,
          certifications: workerInfo.certifications
        };

        result = await registerWorker(workerData);
      } else {
        throw new Error('Información de trabajador faltante');
      }

      if (result.success) {
        setCurrentStep('success');
      }
    } catch (error: any) {
      console.error('Error en registro:', error);
    }
  };

  const handleBack = () => {
    if (currentStep === 'worker-info') {
      setCurrentStep('role');
      setSelectedRole(null);
    } else if (currentStep === 'personal-data') {
      if (selectedRole === 'worker') {
        setCurrentStep('worker-info');
      } else {
        setCurrentStep('role');
        setSelectedRole(null);
      }
    }
  };

  // Renderizar el paso actual
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'role':
        return <RoleSelection onSelectRole={handleRoleSelection} />;

      case 'worker-info':
        return (
          <WorkerInfoForm
            onContinue={handleWorkerInfoSubmit}
            onBack={handleBack}
          />
        );

      case 'personal-data':
        return (
          <PersonalDataForm
            onSubmit={handlePersonalDataSubmit}
            onBack={handleBack}
            isLoading={isLoading}
            error={error || undefined}
          />
        );

      case 'success':
        return <RegisterSuccess userType={selectedRole || 'user'} />;

      default:
        return <RoleSelection onSelectRole={handleRoleSelection} />;
    }
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-lavender overflow-hidden">
      <BgWave />

      {/* Header - Solo mostrar en pasos que no sean success */}
      {currentStep !== 'success' && <LoginHeader />}

      {/* Contenido principal */}
      <div className="w-full flex-1 flex items-center justify-center">
        {renderCurrentStep()}
            </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
      `}</style>
    </main>
  );
}
