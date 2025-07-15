'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Briefcase, 
  User, 
  Settings, 
  LogOut, 
  Bell,
  Search,
  Mail,
  Calendar,
  MapPin,
  Clock,
  Star,
  ChevronRight,
  Menu,
  X,
  Home,
  MessageCircle,
  CreditCard,
  History
} from 'lucide-react';
import VerPerfilButton from '@/components/VerPerfilButton';

export default function Dashboard() {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleCrearServicio = () => {
    router.push('/crear-servicio');
  };

  const handleVerDetalles = (serviceId: number) => {
    router.push(`/detalles-postulantes?id=${serviceId}`);
  };

  const myServices = [
    {
      id: 1,
      title: "Limpieza general de casa",
      category: "Limpieza",
      date: "Hoy, 3:00 PM",
      location: "Bogotá, Chapinero",
      applicants: 3,
      status: "Contratando",
      progress: 75,
      icon: "🧹"
    },
    {
      id: 2,
      title: "Diseño de logo corporativo",
      category: "Diseño",
      date: "Mañana, 10:00 AM",
      location: "Medellín, El Poblado",
      applicants: 8,
      status: "Revisando",
      progress: 45,
      icon: "🎨"
    },
    {
      id: 3,
      title: "Desarrollo de app móvil",
      category: "Desarrollo",
      date: "15 Oct, 2:00 PM",
      location: "Cali, Granada",
      applicants: 12,
      status: "En progreso",
      progress: 30,
      icon: "📱"
    }
  ];

  const topProfessionals = [
    {
      id: 1,
      name: "Juan Pérez",
      profession: "Plomero",
      rating: 4.8,
      avatar: "👨‍🔧"
    },
    {
      id: 2,
      name: "María García",
      profession: "Maestra",
      rating: 4.9,
      avatar: "👩‍🏫"
    },
    {
      id: 3,
      name: "Carlos López",
      profession: "Electricista",
      rating: 4.7,
      avatar: "👨‍🔌"
    }
  ];

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
            <a href="#" className="flex items-center justify-center md:justify-start p-3 rounded-lg bg-white/20 hover:bg-white/30 transition-all duration-200 transform hover:scale-105">
              <Briefcase size={24} className="md:w-5 md:h-5" />
              {!sidebarCollapsed && <span className="ml-3">Mis Servicios</span>}
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
              <User size={24} className="md:w-5 md:h-5" />
              {!sidebarCollapsed && <span className="ml-3">Perfil</span>}
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
              <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg hover:bg-gray-100">
                <Search size={20} className="text-gray-600" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100">
                <Mail size={20} className="text-gray-600" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100">
                <Bell size={20} className="text-gray-600" />
              </button>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">María García</span>
                              <div className="w-8 h-8 bg-gradient-to-r from-[#743fc6] to-[#8a5fd1] rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">MG</span>
              </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-[#743fc6] to-[#8a5fd1] rounded-2xl mb-6 text-white relative overflow-hidden h-48 md:h-56 lg:h-64">
            <div className="flex flex-col md:flex-row items-center justify-between p-6 md:p-8 lg:p-10 h-full relative z-10">
              <div className="flex-1 mb-6 md:mb-0">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">¡Hola, María!</h2>
                <p className="text-purple-100 mb-4 text-sm md:text-base lg:text-lg">Buscas servicios para tu hogar?</p>
                <button 
                  onClick={handleCrearServicio}
                  className="bg-[#fbbc6c] text-white px-4 md:px-6 py-2 md:py-3 rounded-xl font-medium hover:bg-[#f9b055] transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2 text-sm md:text-base"
                >
                  <Plus size={18} className="md:w-5 md:h-5" />
                  <span>Crear Nuevo Servicio</span>
                </button>
              </div>
            </div>
            {/* Image positioned to reach bottom edge */}
            <div className="absolute bottom-0 right-0 h-full flex items-end">
              <img 
                src="/Banner.png" 
                alt="Banner" 
                className="h-full w-auto object-contain" 
              />
            </div>
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-full h-full opacity-10">
              <div className="absolute top-4 right-4 w-32 h-32 bg-white/20 rounded-full"></div>
              <div className="absolute bottom-4 right-8 w-24 h-24 bg-white/20 rounded-full"></div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* My Services Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Mis Servicios</h3>
                  <button className="text-[#743fc6] hover:text-[#8a5fd1] text-sm font-medium">
                    Ver todos
                  </button>
                </div>
                
                <div className="space-y-4">
                  {myServices.map((service) => (
                    <div key={service.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all duration-200 bg-gradient-to-r from-gray-50 to-white">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center text-2xl">
                            {service.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="px-2 py-1 bg-[#743fc6]/10 text-[#743fc6] rounded-full text-xs font-medium">
                                {service.category}
                              </span>
                            </div>
                            <h4 className="font-semibold text-gray-800 mb-2">{service.title}</h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Calendar size={14} />
                                <span>{service.date}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MapPin size={14} />
                                <span>{service.location}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1 mb-2">
                            <User size={14} className="text-[#743fc6]" />
                            <span className="text-sm font-medium text-gray-700">{service.applicants} postulantes</span>
                          </div>
                          <div className="w-16 h-16 relative">
                            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                              <path
                                className="text-gray-200"
                                stroke="currentColor"
                                strokeWidth="3"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                              <path
                                className="text-[#743fc6]"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeDasharray={`${service.progress}, 100`}
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-700">{service.progress}%</span>
                            </div>
                          </div>
                          <p className={`text-xs font-medium mt-1 border-b-2 pb-1 ${
                            service.status === "Contratando" 
                              ? "text-blue-600 border-blue-400" 
                              : service.status === "Revisando" 
                              ? "text-orange-600 border-orange-400" 
                              : "text-green-600 border-green-400"
                          }`}>
                            {service.status}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleVerDetalles(service.id)}
                        className="w-full mt-4 bg-[#743fc6] text-white py-2 rounded-lg hover:bg-[#8a5fd1] transition-colors text-sm font-medium"
                      >
                        Ver detalles y postulantes
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Professionals Section */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Mejores Profesionales</h3>
                <div className="space-y-4">
                  {topProfessionals.map((professional) => (
                    <div key={professional.id} className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all duration-200">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-200 to-pink-200 rounded-xl flex items-center justify-center text-2xl">
                        {professional.avatar}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{professional.name}</h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">{professional.profession}</span>
                          <div className="flex items-center space-x-1">
                            <Star size={12} className="text-yellow-400 fill-current" />
                            <span className="text-xs text-gray-600">{professional.rating}</span>
                          </div>
                        </div>
                      </div>
                      <VerPerfilButton profesionalId={professional.id} />
                    </div>
                  ))}
                </div>
              </div>


            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="flex items-center justify-around py-2">
          <button className="flex flex-col items-center p-2 text-[#743fc6]">
            <Briefcase size={20} />
            <span className="text-xs mt-1">Servicios</span>
          </button>
          <button className="flex flex-col items-center p-2 text-gray-600">
            <MessageCircle size={20} />
            <span className="text-xs mt-1">Chats</span>
          </button>
          <button className="flex flex-col items-center p-2 text-gray-600">
            <CreditCard size={20} />
            <span className="text-xs mt-1">Pagos</span>
          </button>
          <button className="flex flex-col items-center p-2 text-gray-600">
            <History size={20} />
            <span className="text-xs mt-1">Historial</span>
          </button>
        </div>
      </div>
    </div>
  );
}
