import { useState } from 'react';

interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  ubicacion: string;
  fechaRegistro: string;
  foto: string;
  calificacion: number;
  serviciosCompletados: number;
  serviciosActivos: number;
  balance: number;
  preferencias: {
    notificaciones: boolean;
    emailMarketing: boolean;
    privacidad: boolean;
  };
}

interface ServicioReciente {
  id: string;
  titulo: string;
  estado: 'activo' | 'en_proceso' | 'completado' | 'cancelado';
  fecha: string;
  profesional: string;
  precio: number;
}

export const useProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('informacion');

  // Datos de ejemplo del usuario
  const [usuario, setUsuario] = useState<Usuario>({
    id: '1',
    nombre: 'María',
    apellido: 'García',
    email: 'maria.garcia@email.com',
    telefono: '+57 300 123 4567',
    ubicacion: 'Bogotá, Colombia',
    fechaRegistro: '15 de Octubre, 2024',
    foto: '/api/placeholder/200/200',
    calificacion: 4.8,
    serviciosCompletados: 12,
    serviciosActivos: 2,
    balance: 250000,
    preferencias: {
      notificaciones: true,
      emailMarketing: false,
      privacidad: true
    }
  });

  const [formData, setFormData] = useState({
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    email: usuario.email,
    telefono: usuario.telefono,
    ubicacion: usuario.ubicacion
  });

  const serviciosRecientes: ServicioReciente[] = [
    {
      id: '1',
      titulo: 'Limpieza Residencial Completa',
      estado: 'completado',
      fecha: 'Hace 2 días',
      profesional: 'Ana Martínez',
      precio: 120000
    },
    {
      id: '2',
      titulo: 'Reparación de Grifo',
      estado: 'en_proceso',
      fecha: 'Hace 1 semana',
      profesional: 'Carlos López',
      precio: 85000
    },
    {
      id: '3',
      titulo: 'Organización de Closet',
      estado: 'activo',
      fecha: 'Hace 3 días',
      profesional: 'Laura Rodríguez',
      precio: 95000
    }
  ];

  const handleSave = () => {
    setUsuario(prev => ({
      ...prev,
      ...formData
    }));
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      telefono: usuario.telefono,
      ubicacion: usuario.ubicacion
    });
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  return {
    usuario,
    formData,
    isEditing,
    activeTab,
    serviciosRecientes,
    setIsEditing,
    setActiveTab,
    handleSave,
    handleCancel,
    handleInputChange,
    formatPrice
  };
}; 