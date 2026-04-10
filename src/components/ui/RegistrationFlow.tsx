'use client';

import { useState } from 'react';
import { UserTypeSelection } from './UserTypeSelection';
import { ClientRegistrationForm } from './ClientRegistrationForm';
import { WorkerRegistrationForm } from './WorkerRegistrationForm';
import { WorkerProfileForm } from './WorkerProfileForm';

interface RegistrationFlowProps {
  /** Teléfono normalizado (10 dígitos) o identificador de contacto */
  userPhone: string;
  userId: string;
  onComplete: (userData: any) => void;
  isLoading?: boolean;
}

type RegistrationStep = 'type-selection' | 'client-form' | 'worker-basic' | 'worker-profile';

export const RegistrationFlow = ({ 
  userPhone, 
  userId, 
  onComplete, 
  isLoading = false 
}: RegistrationFlowProps) => {
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('type-selection');
  const [userType, setUserType] = useState<'client' | 'worker' | null>(null);
  const [workerBasicData, setWorkerBasicData] = useState<any>(null);

  const handleTypeSelection = (type: 'client' | 'worker') => {
    console.log('🎯 === TYPE SELECTION ===');
    console.log('📊 Selected type:', type);
    console.log('🔑 User ID:', userId);
    console.log('📱 User phone:', userPhone);
    
    setUserType(type);
    if (type === 'client') {
      setCurrentStep('client-form');
    } else {
      setCurrentStep('worker-basic');
    }
  };

  const handleClientComplete = (userData: any) => {
    console.log('🎯 === CLIENT COMPLETE ===');
    console.log('📊 Client form data:', userData);
    
    const completeData = {
      ...userData,
      userType: 'client',
      userId,
      phone: userPhone
    };
    
    console.log('📤 Complete client data:', completeData);
    onComplete(completeData);
  };

  const handleWorkerBasicComplete = (basicData: any) => {
    console.log('🎯 === WORKER BASIC COMPLETE ===');
    console.log('📊 Worker basic form data:', basicData);
    
    // Los datos básicos ya incluyen todo lo necesario, solo falta la descripción del perfil
    setWorkerBasicData(basicData);
    setCurrentStep('worker-profile');
  };

  const handleWorkerProfileComplete = (profileData: any) => {
    console.log('🎯 === WORKER PROFILE COMPLETE ===');
    console.log('📊 Worker profile form data:', profileData);
    console.log('📊 Worker basic data stored:', workerBasicData);
    
    // Combinar todos los datos del trabajador
    const completeData = {
      ...workerBasicData,
      ...profileData,
      userType: 'worker',
      userId,
      phone: userPhone
    };
    
    console.log('📤 Complete worker data:', completeData);
    console.log('🔍 Data validation:');
    console.log('  - userId:', completeData.userId);
    console.log('  - phone:', completeData.phone);
    console.log('  - name:', completeData.name);
    console.log('  - phone:', completeData.phone);
    console.log('  - birthDate:', completeData.birthDate);
    console.log('  - profession:', completeData.profession);
    console.log('  - experienceYears:', completeData.experienceYears);
    console.log('  - profileDescription:', completeData.profileDescription);
    console.log('  - selectedCategories:', completeData.selectedCategories);
    
    onComplete(completeData);
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'client-form':
        setCurrentStep('type-selection');
        break;
      case 'worker-basic':
        setCurrentStep('type-selection');
        break;
      case 'worker-profile':
        setCurrentStep('worker-basic');
        break;
      default:
        setCurrentStep('type-selection');
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'type-selection':
        return (
          <UserTypeSelection
            userEmail={userEmail}
            onSelectType={handleTypeSelection}
          />
        );
      
      case 'client-form':
        return (
          <ClientRegistrationForm
            userEmail={userEmail}
            onComplete={handleClientComplete}
            onBack={handleBack}
            isLoading={isLoading}
          />
        );
      
      case 'worker-basic':
        return (
          <WorkerRegistrationForm
            userEmail={userEmail}
            onComplete={handleWorkerBasicComplete}
            onBack={handleBack}
            isLoading={isLoading}
          />
        );
      
      case 'worker-profile':
        return (
          <WorkerProfileForm
            userEmail={userEmail}
            basicData={workerBasicData}
            onComplete={handleWorkerProfileComplete}
            onBack={handleBack}
            isLoading={isLoading}
          />
        );
      
      default:
        return (
          <UserTypeSelection
            userEmail={userEmail}
            onSelectType={handleTypeSelection}
          />
        );
    }
  };

  return renderCurrentStep();
};
