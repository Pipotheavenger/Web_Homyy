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
import PhoneInput from '@/components/ui/PhoneInput';
import PhoneVerifyForm from '@/components/ui/PhoneVerifyForm';

type RegistrationStep = 'role' | 'worker-info' | 'phone-verify' | 'personal-data' | 'success';
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
  birthDate: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('role');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [workerInfo, setWorkerInfo] = useState<WorkerInfoData | null>(null);
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string | undefined>(undefined);
  const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null);
  const { isLoading, error, registerUser, registerWorker, clearError } = useRegister();

  // Funciones de navegación
  const handleRoleSelection = (role: UserRole) => {
    setSelectedRole(role);
    if (role === 'user') {
      setCurrentStep('phone-verify');
    } else {
      setCurrentStep('worker-info');
    }
  };

  const handleWorkerInfoSubmit = (data: WorkerInfoData) => {
    setWorkerInfo(data);
    setCurrentStep('phone-verify');
  };

  const handlePersonalDataSubmit = async (data: PersonalData & { phone: string }) => {
    if (!selectedRole) return;

    clearError();

    try {
      let result;

      if (selectedRole === 'user') {
        const userData: RegisterUserData = {
          fullName: data.fullName,
          phone: data.phone,
          birthDate: data.birthDate,
          password: data.password,
          confirmPassword: data.confirmPassword
        };

        result = await registerUser(userData);
      } else if (selectedRole === 'worker' && workerInfo) {
        const workerData: RegisterWorkerData = {
          fullName: data.fullName,
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
      setWorkerInfo(null);
      setVerifiedPhone(null);
      setPhone('');
      setPhoneError(undefined);
    } else if (currentStep === 'personal-data') {
      setCurrentStep('phone-verify');
    } else if (currentStep === 'phone-verify') {
      if (selectedRole === 'worker') setCurrentStep('worker-info');
      else setCurrentStep('role');
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

      case 'phone-verify':
        return (
          <div className="w-full max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-black">
                ¡Ya casi terminas!
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                Solo un paso más para proteger tu cuenta
              </p>
            </div>

            <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl p-8 space-y-6">
              {!verifiedPhone ? (
                <>
                  <PhoneInput
                    value={phone}
                    onChange={(v) => {
                      setPhone(v);
                      setPhoneError(undefined);
                    }}
                    error={phoneError}
                  />

                  <div className="flex gap-4 pt-2">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex-1 py-3 px-6 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                    >
                      Atrás
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const digits = phone.replace(/\D/g, '');
                        if (!/^\d{10}$/.test(digits)) {
                          setPhoneError('El número debe tener exactamente 10 dígitos');
                          return;
                        }
                        setVerifiedPhone(digits); // se verifica en el siguiente subpaso (OTP)
                      }}
                      className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg shadow-purple-600/25"
                    >
                      Enviar código
                    </button>
                  </div>
                </>
              ) : (
                <PhoneVerifyForm
                  phoneNumber={verifiedPhone}
                  onBack={() => {
                    setVerifiedPhone(null);
                  }}
                  onVerified={() => {
                    setCurrentStep('personal-data');
                  }}
                />
              )}
            </div>
          </div>
        );

      case 'personal-data':
        return (
          <PersonalDataForm
            onSubmit={handlePersonalDataSubmit}
            onBack={handleBack}
            isLoading={isLoading}
            error={error || undefined}
            phone={verifiedPhone ?? phone.replace(/\D/g, '')}
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
