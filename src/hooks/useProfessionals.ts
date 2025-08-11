import { useState, useMemo } from 'react';

interface Profesional {
  id: number;
  nombre: string;
  apellido: string;
  especialidad: string;
  calificacion: number;
  ubicacion: string;
  experiencia: number;
  serviciosCompletados: number;
  avatar: string;
  disponible: boolean;
}

export const useProfessionals = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const profesionales: Profesional[] = [
    {
      id: 1,
      nombre: "Juan",
      apellido: "Pérez",
      especialidad: "Plomero",
      calificacion: 4.8,
      ubicacion: "Bogotá, Chapinero",
      experiencia: 8,
      serviciosCompletados: 156,
      avatar: "👨‍🔧",
      disponible: true
    },
    {
      id: 2,
      nombre: "María",
      apellido: "González",
      especialidad: "Limpieza Profesional",
      calificacion: 4.9,
      ubicacion: "Bogotá, Usaquén",
      experiencia: 5,
      serviciosCompletados: 127,
      avatar: "👩‍💼",
      disponible: true
    },
    {
      id: 3,
      nombre: "Carlos",
      apellido: "López",
      especialidad: "Electricista",
      calificacion: 4.7,
      ubicacion: "Bogotá, Teusaquillo",
      experiencia: 12,
      serviciosCompletados: 203,
      avatar: "👨‍🔌",
      disponible: false
    },
    {
      id: 4,
      nombre: "Ana",
      apellido: "Martínez",
      especialidad: "Diseñadora de Interiores",
      calificacion: 4.9,
      ubicacion: "Bogotá, La Soledad",
      experiencia: 6,
      serviciosCompletados: 89,
      avatar: "👩‍🎨",
      disponible: true
    },
    {
      id: 5,
      nombre: "Roberto",
      apellido: "Hernández",
      especialidad: "Carpintero",
      calificacion: 4.6,
      ubicacion: "Bogotá, Chapinero",
      experiencia: 15,
      serviciosCompletados: 312,
      avatar: "👨‍🔨",
      disponible: true
    },
    {
      id: 6,
      nombre: "Laura",
      apellido: "Rodríguez",
      especialidad: "Jardinera",
      calificacion: 4.8,
      ubicacion: "Bogotá, Usaquén",
      experiencia: 7,
      serviciosCompletados: 134,
      avatar: "👩‍🌾",
      disponible: true
    }
  ];

  const filteredProfesionales = useMemo(() => {
    return profesionales.filter(profesional =>
      profesional.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profesional.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profesional.especialidad.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    filteredProfesionales
  };
}; 