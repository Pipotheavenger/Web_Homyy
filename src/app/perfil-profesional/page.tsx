'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  History,
  ChevronLeft,
  ChevronDown,
  Edit,
  Trash2,
  Phone,
  Heart,
  Eye,
  DollarSign,
  Award,
  CalendarDays,
  Users,
  CheckCircle,
  Star as StarIcon,
  ArrowLeft
} from 'lucide-react';

interface Profesional {
  id: string;
  nombre: string;
  apellido: string;
  especialidad: string;
  experiencia: number;
  calificacion: number;
  serviciosCompletados: number;
  ubicacion: string;
  descripcion: string;
  vidaLaboral: string;
  certificaciones: string[];
  areasServicio: string[];
  servicios: Servicio[];
  trabajosRecientes: TrabajoReciente[];
  reseñas: Reseña[];
  foto: string;
}

interface TrabajoReciente {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  imagen: string;
}

interface Reseña {
  id: string;
  cliente: string;
  calificacion: number;
  comentario: string;
  fecha: string;
  servicio: string;
}

interface Servicio {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  duracion: string;
  disponible: boolean;
  imagen: string;
}

export default function PerfilProfesionalPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const profesionalId = searchParams.get('id');
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Datos de ejemplo del profesional (en una app real vendrían de la base de datos)
  const [profesional, setProfesional] = useState<Profesional>({
    id: profesionalId || '1',
    nombre: 'María',
    apellido: 'González',
    especialidad: 'Limpieza Profesional',
    experiencia: 5,
    calificacion: 4.8,
    serviciosCompletados: 127,
    ubicacion: 'Bogotá, Colombia',
    descripcion: 'Profesional con más de 5 años de experiencia en limpieza residencial y comercial. Especializada en técnicas eco-friendly y organización de espacios.',
    vidaLaboral: 'Inicié mi carrera en el sector de servicios domésticos en 2019, trabajando inicialmente con familias particulares. A lo largo de estos años, he desarrollado especialización en técnicas de limpieza ecológica y organización profesional de espacios. He trabajado con más de 200 clientes satisfechos, incluyendo residencias de lujo, oficinas corporativas y espacios comerciales.',
    certificaciones: [
      'Certificación en Limpieza Profesional - Instituto Colombiano de Servicios',
      'Manejo de Productos Ecológicos - Green Clean Colombia',
      'Organización de Espacios - Academia de Organización Profesional',
      'Seguridad Laboral - SENA',
      'Atención al Cliente - Cámara de Comercio de Bogotá'
    ],
    areasServicio: [
      'Chapinero',
      'Usaquén', 
      'Teusaquillo',
      'La Soledad',
      'Rosales',
      'Zona T'
    ],
    servicios: [
      {
        id: '1',
        nombre: 'Limpieza General Residencial',
        descripcion: 'Limpieza completa de hogares incluyendo cocina, baños, dormitorios y áreas comunes',
        precio: 80000,
        duracion: '4-6 horas',
        disponible: true,
        imagen: '/api/placeholder/150/100'
      },
      {
        id: '2',
        nombre: 'Limpieza Post-Mudanza',
        descripcion: 'Limpieza profunda después de mudanzas, incluyendo paredes y ventanas',
        precio: 120000,
        duracion: '6-8 horas',
        disponible: true,
        imagen: '/api/placeholder/150/100'
      },
      {
        id: '3',
        nombre: 'Organización de Closets',
        descripcion: 'Organización y limpieza de closets y armarios con técnicas profesionales',
        precio: 60000,
        duracion: '3-4 horas',
        disponible: false,
        imagen: '/api/placeholder/150/100'
      }
    ],
    trabajosRecientes: [
      {
        id: '1',
        titulo: 'Limpieza Residencial Completa',
        descripcion: 'Limpieza profunda de casa de 3 habitaciones en Chapinero',
        fecha: '15 Oct 2024',
        imagen: '/api/placeholder/300/200'
      },
      {
        id: '2',
        titulo: 'Organización de Oficina',
        descripcion: 'Organización y limpieza de espacio de trabajo corporativo',
        fecha: '12 Oct 2024',
        imagen: '/api/placeholder/300/200'
      },
      {
        id: '3',
        titulo: 'Limpieza Post-Evento',
        descripcion: 'Limpieza después de evento corporativo en zona T',
        fecha: '10 Oct 2024',
        imagen: '/api/placeholder/300/200'
      },
      {
        id: '4',
        titulo: 'Organización de Closet',
        descripcion: 'Reorganización completa de closet principal',
        fecha: '8 Oct 2024',
        imagen: '/api/placeholder/300/200'
      }
    ],
    reseñas: [
      {
        id: '1',
        cliente: 'Ana Martínez',
        calificacion: 5,
        comentario: 'Excelente trabajo! María es muy profesional y detallista. Mi casa quedó impecable.',
        fecha: 'Hace 2 días',
        servicio: 'Limpieza General Residencial'
      },
      {
        id: '2',
        cliente: 'Carlos Rodríguez',
        calificacion: 5,
        comentario: 'Muy satisfecho con el servicio. Puntual, eficiente y muy limpia.',
        fecha: 'Hace 1 semana',
        servicio: 'Limpieza Post-Mudanza'
      },
      {
        id: '3',
        cliente: 'Laura Sánchez',
        calificacion: 4,
        comentario: 'Buen trabajo en general. Recomendada para futuros servicios.',
        fecha: 'Hace 2 semanas',
        servicio: 'Organización de Closet'
      },
      {
        id: '4',
        cliente: 'Roberto López',
        calificacion: 5,
        comentario: 'Increíble profesionalismo. Superó todas mis expectativas.',
        fecha: 'Hace 3 semanas',
        servicio: 'Limpieza General Residencial'
      }
    ],
    foto: '/api/placeholder/200/200'
  });

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleVolver = () => {
    router.back();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        size={16}
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
            <a href="#" className="flex items-center justify-center md:justify-start p-3 rounded-lg hover:bg-white/20 transition-all duration-200 transform hover:scale-105">
              <MessageCircle size={24} className="md:w-5 md:h-5" />
              {!sidebarCollapsed && <span className="ml-3">Chat</span>}
            </a>
            <a href="/pagos" className="flex items-center justify-center md:justify-start p-3 rounded-lg hover:bg-white/20 transition-all duration-200 transform hover:scale-105">
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
        <header className="bg-white shadow-sm border-b px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
              >
                <Menu size={24} />
              </button>
              <button
                onClick={handleVolver}
                className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Perfil del Profesional</h1>
                <nav className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                  <span>Inicio</span>
                  <span className="mx-2">›</span>
                  <span>Profesionales</span>
                  <span className="mx-2">›</span>
                  <span className="text-[#743fc6]">{profesional.nombre} {profesional.apellido}</span>
                </nav>
              </div>
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
                <span className="text-sm font-medium text-gray-700">Usuario</span>
                <div className="w-8 h-8 bg-gradient-to-r from-[#743fc6] to-[#8a5fd1] rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">U</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="relative">
          {/* Purple Header with Wave Shape */}
          <div className="bg-[#743fc6] relative overflow-hidden">
            {/* Organic Wave Shape */}
            <div className="absolute bottom-0 left-0 w-full">
              <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-24 sm:h-28 lg:h-32">
                <path 
                  d="M0,0 C200,80 400,20 600,80 C800,140 1000,40 1200,80 L1200,120 L0,120 Z" 
                  fill="white"
                />
              </svg>
            </div>
            
            {/* Header Content */}
            <div className="relative z-10 px-4 sm:px-6 py-10 sm:py-12 lg:py-16">
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-8">
                {/* Profile Image - Positioned at same level as name */}
                <div className="flex items-center gap-4 lg:gap-6">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden bg-white/20 border-4 border-white shadow-lg">
                    <img 
                      src={profesional.foto} 
                      alt={`${profesional.nombre} ${profesional.apellido}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Profile Info */}
                  <div className="flex-1 text-white">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">
                      {profesional.nombre} {profesional.apellido}
                    </h2>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-2">
                      <p className="text-base sm:text-lg text-white/90">{profesional.especialidad}</p>
                      <div className="flex flex-wrap gap-2">
                        <div className="bg-[#fbbc6c] rounded-lg px-3 py-1 flex items-center gap-1">
                          <Award size={16} />
                          <span className="text-sm font-medium text-white">{profesional.experiencia} años</span>
                        </div>
                        <div className="bg-[#fbbc6c] rounded-lg px-3 py-1 flex items-center gap-1">
                          <Bell size={16} />
                          <span className="text-sm font-medium text-white">{profesional.serviciosCompletados} servicios</span>
                        </div>
                        <div className="flex items-center gap-1 text-white">
                          {renderStars(profesional.calificacion)}
                          <span className="text-sm font-medium">{profesional.calificacion}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-white/80 mb-4">
                      <MapPin size={16} />
                      <span className="text-sm">{profesional.ubicacion}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="px-4 sm:px-6 py-6 sm:py-8">
            {/* Detalles del Profesional Section - First */}
            <div className="mb-6 lg:mb-8">
              <div className="bg-white rounded-2xl shadow-sm border-2 border-[#743fc6] p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Detalles del Profesional</h3>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setIsEditing(!isEditing)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                    >
                      <Edit size={16} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Nombre</label>
                    <p className="text-gray-800 font-medium">{profesional.nombre}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Apellido</label>
                    <p className="text-gray-800 font-medium">{profesional.apellido}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Especialidad</label>
                    <p className="text-gray-800 font-medium">{profesional.especialidad}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Años de Experiencia</label>
                    <p className="text-gray-800 font-medium">{profesional.experiencia} años</p>
                  </div>
                  <div className="md:col-span-2 lg:col-span-3">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Descripción</label>
                    <p className="text-gray-700 text-sm leading-relaxed">{profesional.descripcion}</p>
                  </div>
                  <div className="md:col-span-2 lg:col-span-3">
                    <label className="block text-sm font-medium text-gray-600 mb-2">Certificaciones</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {profesional.certificaciones.map((cert, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle size={14} className="text-green-500" />
                          <span className="text-sm text-gray-700">{cert}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trabajos Recientes Section */}
            <div className="mb-6 lg:mb-8">
              <div className="bg-[#e0cdff] rounded-2xl shadow-sm p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Trabajos Recientes</h3>
                  <div className="w-16 h-1 bg-[#7d4ccb] rounded-full"></div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {profesional.trabajosRecientes.map((trabajo) => (
                    <div key={trabajo.id} className="bg-white rounded-xl overflow-hidden hover:shadow-md transition-all duration-200">
                      <div className="aspect-video bg-gray-200">
                        <img 
                          src={trabajo.imagen} 
                          alt={trabajo.titulo}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-800 mb-1 text-sm">{trabajo.titulo}</h4>
                        <p className="text-gray-600 text-xs mb-2">{trabajo.descripcion}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{trabajo.fecha}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Reseñas Section - Last */}
            <div className="mb-6 lg:mb-8">
              <div className="bg-[#ffe2be] rounded-2xl shadow-sm p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Reseñas</h3>
                  <div className="w-16 h-1 bg-[#7d4ccb] rounded-full"></div>
                </div>
                
                <div className="space-y-4">
                  {profesional.reseñas.map((reseña) => (
                    <div key={reseña.id} className="bg-white rounded-xl p-4 hover:shadow-md transition-all duration-200">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 bg-[#743fc6]/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-[#743fc6] font-semibold text-sm">
                            {reseña.cliente.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-gray-800">{reseña.cliente}</h4>
                            <div className="flex items-center gap-1">
                              {renderStars(reseña.calificacion)}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">{reseña.servicio}</p>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-700 leading-relaxed mb-2">
                        "{reseña.comentario}"
                      </p>
                      
                      <div className="text-xs text-gray-500">{reseña.fecha}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 