'use client';

import { useState } from 'react';
import { WorkerSelectionModal } from '@/components/ui/WorkerSelectionModal';

export default function TestModalPage() {
  const [isOpen, setIsOpen] = useState(false);

  const mockPostulante = {
    id: 'test-1',
    workerId: 'worker-1',
    nombre: 'Juan',
    apellido: 'Pérez',
    especialidad: 'Plomería',
    experiencia: 5,
    calificacion: 4.5,
    serviciosCompletados: 25,
    precio: 100000,
    foto: ''
  };

  const handleConfirm = async (): Promise<boolean> => {
    console.log('Confirmando selección...');
    // Simular delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Selección confirmada');
    return true; // Simular éxito
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-8 shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Test Modal</h1>
        <p className="mb-4">Prueba del WorkerSelectionModal</p>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Abrir Modal
        </button>
      </div>

      <WorkerSelectionModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirm}
        postulante={mockPostulante}
        serviceTitle="Servicio de Prueba"
      />
    </div>
  );
}
