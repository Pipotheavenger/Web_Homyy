'use client';
import { useState } from 'react';
import { 
  Briefcase, 
  User, 
  Settings, 
  LogOut, 
  Bell,
  Search,
  Mail,
  Menu,
  Star,
  MapPin,
  Clock,
  MessageCircle,
  CreditCard,
  History,
  ChevronRight
} from 'lucide-react';
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        className={`${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full bg-gradient-to-b from-[#743fc6] to-[#8a5fd1] text-white transition-all duration-300 ease-in-out z-50 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-purple-400/30">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-[#fbbc6c] rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              {!sidebarCollapsed && (
                <h2 className="text-xl font-bold">Hommy</h2>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <a href="/dashboard" className="flex items-center justify-center md:justify-start p-3 rounded-lg hover:bg-white/20 transition-all duration-200 transform hover:scale-105">
              <Briefcase size={24} className="md:w-5 md:h-5" />
              {!sidebarCollapsed && <span className="ml-3">Mis Servicios</span>}
            </a>
            <a href="#" className="flex items-center justify-center md:justify-start p-3 rounded-lg bg-white/20 hover:bg-white/30 transition-all duration-200 transform hover:scale-105">
              <User size={24} className="md:w-5 md:h-5" />
              {!sidebarCollapsed && <span className="ml-3">Profesionales</span>}
            </a>
            <a href="#" className="flex items-center justify-center md:justify-start p-3 rounded-lg hover:bg-white/20 transition-all duration-200 transform hover:scale-105">
              <MessageCircle size={24} className="md:w-5 md:h-5" />
              {!sidebarCollapsed && <span className="ml-3">Chat</span>}
            </a>
            <a href="#" className="flex items-center justify-center md:justify-start p-3 rounded-lg hover:bg-white/20 transition-all duration-200 transform hover:scale-105">
              <CreditCard size={24} className="md:w-5 md:h-5" />
              {!sidebarCollapsed && <span className="ml-3">Pagos</span>}
            </a>
            <a href="#" className="flex items-center justify-center md:justify-start p-3 rounded-lg hover:bg-white/20 transition-all duration-200 transform hover:scale-105">
              <History size={24} className="md:w-5 md:h-5" />
              {!sidebarCollapsed && <span className="ml-3">Historial</span>}
            </a>
            <a href="#" className="flex items-center justify-center md:justify-start p-3 rounded-lg hover:bg-white/20 transition-all duration-200 transform hover:scale-105">
              <Settings size={24} className="md:w-5 md:h-5" />
              {!sidebarCollapsed && <span className="ml-3">Configuración</span>}
            </a>
          </nav>

          {/* Premium CTA */}
          {!sidebarCollapsed && (
            <div className="p-4 border-t border-white/20">
              <div className="bg-white/10 border border-white/20 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-2">
                      <span className="text-white text-sm">💼</span>
                    </div>
                    <div>
                      <p className="text-xs font-medium">¡Usa nuestras</p>
                      <p className="text-xs font-medium">funciones Premium!</p>
                    </div>
                  </div>
                  <ChevronRight size={16} />
                </div>
              </div>
            </div>
          )}

          {/* Logout */}
          <div className="p-4 border-t border-white/20">
            <button className="flex items-center justify-center md:justify-start p-3 rounded-lg hover:bg-white/20 transition-all duration-200 transform hover:scale-105 w-full">
              <LogOut size={24} className="md:w-5 md:h-5" />
              {!sidebarCollapsed && <span className="ml-3">Cerrar sesión</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        {/* Header */}
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
              >
                <Menu size={24} />
              </button>
              <h1 className="text-2xl font-bold text-gray-800">Profesionales</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg hover:bg-gray-100">
                <Mail size={20} className="text-gray-600" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100">
                <Bell size={20} className="text-gray-600" />
              </button>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Usuario</span>
                <div className="w-8 h-8 bg-gradient-to-r from-[#743fc6] to-[#8a5fd1] rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">U</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar profesionales..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#743fc6]/20 focus:border-[#743fc6] outline-none transition-all duration-300"
              />
            </div>
          </div>

          {/* Professionals Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfesionales.map((profesional) => (
              <div key={profesional.id} className="bg-white rounded-2xl shadow-sm border p-6 hover:shadow-md transition-all duration-200">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-200 to-pink-200 rounded-xl flex items-center justify-center text-2xl">
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
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {profesional.disponible ? 'Disponible' : 'Ocupado'}
                  </div>
                </div>

                {/* Rating and Stats */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {renderStars(profesional.calificacion)}
                    <span className="text-sm font-medium text-gray-700">
                      {profesional.calificacion}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {profesional.serviciosCompletados} servicios
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin size={14} />
                    <span>{profesional.ubicacion}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock size={14} />
                    <span>{profesional.experiencia} años de experiencia</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <VerPerfilButton 
                    profesionalId={profesional.id}
                    className="flex-1 py-2 bg-[#743fc6] text-white rounded-lg hover:bg-[#8a5fd1] transition-colors text-sm font-medium"
                    showIcon={true}
                  />
                  <button className="p-2 text-gray-400 hover:text-[#743fc6] hover:bg-[#743fc6]/10 rounded-lg transition-all duration-200">
                    <MessageCircle size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* No Results */}
          {filteredProfesionales.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">No se encontraron profesionales</h3>
              <p className="text-gray-600">Intenta con otros términos de búsqueda</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="flex items-center justify-around py-2">
          <a href="/dashboard" className="flex flex-col items-center p-2 text-gray-600">
            <Briefcase size={20} />
            <span className="text-xs mt-1">Servicios</span>
          </a>
          <button className="flex flex-col items-center p-2 text-[#743fc6]">
            <User size={20} />
            <span className="text-xs mt-1">Profesionales</span>
          </button>
          <button className="flex flex-col items-center p-2 text-gray-600">
            <MessageCircle size={20} />
            <span className="text-xs mt-1">Chats</span>
          </button>
          <button className="flex flex-col items-center p-2 text-gray-600">
            <CreditCard size={20} />
            <span className="text-xs mt-1">Pagos</span>
          </button>
        </div>
      </div>
    </div>
  );
} 