'use client';
import { useState } from 'react';
import { LoginHeader } from '@/components/ui/LoginHeader';
import RoleSelection from '@/components/ui/RoleSelection';
import WorkerInfoForm from '@/components/ui/WorkerInfoForm';
import PersonalDataForm from '@/components/ui/PersonalDataForm';
import PhoneVerifyForm from '@/components/ui/PhoneVerifyForm';
import RegisterSuccess from '@/components/ui/RegisterSuccess';
import BgWave from '../login/BgWave';
import { useRegister } from '@/hooks/useRegister';
import { RegisterUserData, RegisterWorkerData } from '@/types/database';

type RegistrationStep = 'role' | 'worker-info' | 'personal-data' | 'phone-verify' | 'success';
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
  const [pendingPersonalData, setPendingPersonalData] = useState<PersonalData | null>(null);
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

    // Guardar datos y avanzar a verificación telefónica
    setPendingPersonalData(data);
    setCurrentStep('phone-verify');
  };

  const handlePhoneVerified = async () => {
    if (!selectedRole || !pendingPersonalData) return;

    clearError();

    try {
      let result;

      if (selectedRole === 'user') {
        const userData: RegisterUserData = {
          fullName: pendingPersonalData.fullName,
          email: pendingPersonalData.email,
          phone: pendingPersonalData.phone,
          birthDate: pendingPersonalData.birthDate,
          password: pendingPersonalData.password,
          confirmPassword: pendingPersonalData.confirmPassword
        };

        result = await registerUser(userData);
      } else if (selectedRole === 'worker' && workerInfo) {
        const workerData: RegisterWorkerData = {
          fullName: pendingPersonalData.fullName,
          email: pendingPersonalData.email,
          phone: pendingPersonalData.phone,
          birthDate: pendingPersonalData.birthDate,
          password: pendingPersonalData.password,
          confirmPassword: pendingPersonalData.confirmPassword,
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

      if (result.success && result.userId) {
        // Marcar teléfono como verificado en el perfil
        try {
          await fetch('/api/auth/phone-verify/mark-verified', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: result.userId }),
          });
        } catch (err) {
          console.warn('No se pudo marcar el teléfono como verificado:', err);
        }
        setCurrentStep('success');
      } else if (result.success) {
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
    } else if (currentStep === 'phone-verify') {
      setCurrentStep('personal-data');
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
            initialData={pendingPersonalData || undefined}
          />
        );

      case 'phone-verify':
        return (
          <PhoneVerifyForm
            phoneNumber={pendingPersonalData?.phone.replace(/\s/g, '') || ''}
            onVerified={handlePhoneVerified}
            onBack={handleBack}
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
