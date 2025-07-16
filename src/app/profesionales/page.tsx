'use client';
import { useState } from 'react';
import { 
  Star,
  MapPin,
  Clock,
  ChevronRight
} from 'lucide-react';
import Layout from '@/components/Layout';
import VerPerfilButton from '@/components/VerPerfilButton';

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

export default function ProfesionalesPage() {
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

  const filteredProfesionales = profesionales.filter(profesional =>
    profesional.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profesional.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profesional.especialidad.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        className={`${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : i < rating 
              ? 'text-yellow-400 fill-current' 
              : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <Layout title="Profesionales" currentPage="profesionales">
      <div className="p-6">
        {/* Header con búsqueda */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Encuentra Profesionales</h1>
              <p className="text-gray-600">Conecta con profesionales calificados para tus servicios</p>
            </div>
            
            <div className="relative w-full sm:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Buscar profesionales..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-[#743fc6]/20 focus:border-[#743fc6] sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Grid de profesionales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfesionales.map((profesional) => (
            <div key={profesional.id} className="bg-white rounded-2xl shadow-sm border p-6 hover:shadow-md transition-all duration-200">
              {/* Header del profesional */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#743fc6] to-[#8a5fd1] rounded-full flex items-center justify-center text-2xl">
                    {profesional.avatar}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {profesional.nombre} {profesional.apellido}
                    </h3>
                    <p className="text-sm text-gray-600">{profesional.especialidad}</p>
                  </div>
                </div>
                
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  profesional.disponible 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {profesional.disponible ? 'Disponible' : 'Ocupado'}
                </div>
              </div>

              {/* Información del profesional */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin size={14} />
                  <span>{profesional.ubicacion}</span>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Clock size={14} />
                    <span>{profesional.experiencia} años</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ChevronRight size={14} />
                    <span>{profesional.serviciosCompletados} servicios</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    {renderStars(profesional.calificacion)}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{profesional.calificacion}</span>
                </div>
              </div>

              {/* Botón Ver Perfil */}
              <VerPerfilButton profesionalId={profesional.id.toString()} />
            </div>
          ))}
        </div>

        {/* Mensaje cuando no hay resultados */}
        {filteredProfesionales.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron profesionales</h3>
            <p className="text-gray-600">Intenta con otros términos de búsqueda</p>
          </div>
        )}
      </div>
    </Layout>
  );
} 