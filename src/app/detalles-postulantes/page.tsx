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
  Filter,
  SortAsc,
  MoreVertical,
  UserCheck,
  UserX,
  UserPlus,
  MessageSquare,
  PhoneCall,
  Mail as MailIcon,
  Clock as ClockIcon,
  MapPin as MapPinIcon,
  DollarSign as DollarSignIcon,
  ArrowLeft
} from 'lucide-react';

interface Postulante {
  id: string;
  nombre: string;
  apellido: string;
  especialidad: string;
  experiencia: number;
  calificacion: number;
  serviciosCompletados: number;
  ubicacion: string;
  precio: number;
  disponibilidad: string;
  foto: string;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  fechaPostulacion: string;
  telefono: string;
  email: string;
}

interface Servicio {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  ubicacion: string;
  presupuesto: number;
  fechaPublicacion: string;
  fechaLimite: string;
  estado: 'activo' | 'en_proceso' | 'completado';
  postulantes: number;
  progreso: number;
  etapa: string;
  horariosDisponibilidad: string[];
}

export default function DetallesPostulantesPage() {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('todos');
  const [selectedSort, setSelectedSort] = useState('reciente');

  // Datos de ejemplo del servicio
  const [servicio, setServicio] = useState<Servicio>({
    id: '1',
    titulo: 'Limpieza Residencial Completa',
    descripcion: 'Necesito servicios de limpieza profesional para mi casa de 3 habitaciones. Incluye cocina, baños, dormitorios y áreas comunes. Preferiblemente con productos eco-friendly.',
    categoria: 'Limpieza Profesional',
    ubicacion: 'Chapinero, Bogotá',
    presupuesto: 120000,
    fechaPublicacion: '15 Oct 2024',
    fechaLimite: '25 Oct 2024',
    estado: 'activo',
    postulantes: 8,
    progreso: 75,
    etapa: 'Contratando',
    horariosDisponibilidad: [
      'Lunes - Viernes: 9:00 AM - 5:00 PM',
      'Sábados: 9:00 AM - 2:00 PM',
      'Domingos: No disponible'
    ]
  });

  // Datos de ejemplo de postulantes
  const [postulantes, setPostulantes] = useState<Postulante[]>([
    {
      id: '1',
      nombre: 'María',
      apellido: 'González',
      especialidad: 'Limpieza Profesional',
      experiencia: 5,
      calificacion: 4.8,
      serviciosCompletados: 127,
      ubicacion: 'Chapinero, Bogotá',
      precio: 100000,
      disponibilidad: 'Inmediata',
      foto: '/api/placeholder/200/200',
      estado: 'pendiente',
      fechaPostulacion: 'Hace 2 días',
      telefono: '+57 300 123 4567',
      email: 'maria.gonzalez@email.com'
    },
    {
      id: '2',
      nombre: 'Carlos',
      apellido: 'Rodríguez',
      especialidad: 'Limpieza Residencial',
      experiencia: 3,
      calificacion: 4.6,
      serviciosCompletados: 89,
      ubicacion: 'Usaquén, Bogotá',
      precio: 95000,
      disponibilidad: 'Esta semana',
      foto: '/api/placeholder/200/200',
      estado: 'aprobado',
      fechaPostulacion: 'Hace 1 día',
      telefono: '+57 310 987 6543',
      email: 'carlos.rodriguez@email.com'
    },
    {
      id: '3',
      nombre: 'Ana',
      apellido: 'Martínez',
      especialidad: 'Limpieza Profesional',
      experiencia: 7,
      calificacion: 4.9,
      serviciosCompletados: 203,
      ubicacion: 'Teusaquillo, Bogotá',
      precio: 110000,
      disponibilidad: 'Inmediata',
      foto: '/api/placeholder/200/200',
      estado: 'pendiente',
      fechaPostulacion: 'Hace 3 días',
      telefono: '+57 315 456 7890',
      email: 'ana.martinez@email.com'
    },
    {
      id: '4',
      nombre: 'Luis',
      apellido: 'Sánchez',
      especialidad: 'Limpieza Ecológica',
      experiencia: 4,
      calificacion: 4.7,
      serviciosCompletados: 156,
      ubicacion: 'La Soledad, Bogotá',
      precio: 105000,
      disponibilidad: 'Próxima semana',
      foto: '/api/placeholder/200/200',
      estado: 'rechazado',
      fechaPostulacion: 'Hace 4 días',
      telefono: '+57 320 111 2222',
      email: 'luis.sanchez@email.com'
    }
  ]);

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

  const handleVerDetalles = (serviceId: number) => {
    router.push(`/detalles-postulantes?id=${serviceId}`);
  };

  const handleVerPerfil = (profesionalId: string) => {
    router.push(`/perfil-profesional?id=${profesionalId}`);
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
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Detalles y Postulantes</h1>
                <nav className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                  <span>Inicio</span>
                  <span className="mx-2">›</span>
                  <span>Mis Servicios</span>
                  <span className="mx-2">›</span>
                  <span className="text-[#743fc6]">{servicio.titulo}</span>
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
        <div className="p-4 sm:p-6">
          {/* Service Details */}
          <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">{servicio.titulo}</h2>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {servicio.estado === 'activo' ? 'Activo' : servicio.estado}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-2">
                <MapPinIcon size={20} className="text-[#743fc6]" />
                <span className="text-gray-700">{servicio.ubicacion}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={20} className="text-[#743fc6]" />
                <span className="text-gray-700">Publicado: {servicio.fechaPublicacion}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={20} className="text-[#743fc6]" />
                <span className="text-gray-700">{servicio.postulantes} postulantes</span>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Descripción</h3>
              <p className="text-gray-700 leading-relaxed">{servicio.descripcion}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Horarios de Disponibilidad</h3>
              <div className="space-y-2">
                {servicio.horariosDisponibilidad.map((horario, index) => (
                  <div key={index} className="flex items-center gap-2 text-gray-700">
                    <Clock size={16} className="text-[#743fc6]" />
                    <span className="text-sm">{horario}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  <span>Fecha límite: {servicio.fechaLimite}</span>
                </div>
                <div className="flex items-center gap-2">
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
                        strokeDasharray={`${servicio.progreso}, 100`}
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-700">{servicio.progreso}%</span>
                    </div>
                  </div>
                  <div>
                    <p className={`text-sm font-medium border-b-2 pb-1 ${
                      servicio.etapa === "Contratando" 
                        ? "text-blue-600 border-blue-400" 
                        : servicio.etapa === "Revisando" 
                        ? "text-orange-600 border-orange-400" 
                        : "text-green-600 border-green-400"
                    }`}>
                      {servicio.etapa}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-[#743fc6] text-white rounded-lg hover:bg-[#6a37b8] transition-all duration-200">
                  Editar Servicio
                </button>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200">
                  Cerrar Servicio
                </button>
              </div>
            </div>
          </div>

          {/* Filters and Actions */}
          <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold text-gray-800">Postulantes ({postulantes.length})</h3>
                <div className="flex gap-2">
                  <select 
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#743fc6]"
                  >
                    <option value="todos">Todos</option>
                    <option value="pendiente">Pendientes</option>
                    <option value="aprobado">Aprobados</option>
                    <option value="rechazado">Rechazados</option>
                  </select>
                  <select 
                    value={selectedSort}
                    onChange={(e) => setSelectedSort(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#743fc6]"
                  >
                    <option value="reciente">Más recientes</option>
                    <option value="experiencia">Más experiencia</option>
                    <option value="calificacion">Mejor calificación</option>
                    <option value="precio">Menor precio</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-[#fbbc6c] text-white rounded-lg hover:bg-[#f9b055] transition-all duration-200 flex items-center gap-2">
                  <UserPlus size={16} />
                  Eliminar Servicio
                </button>
              </div>
            </div>
          </div>

          {/* Postulantes List */}
          <div className="space-y-4">
            {postulantes.map((postulante) => (
              <div key={postulante.id} className="bg-white rounded-2xl shadow-sm border p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Profile Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                      <img 
                        src={postulante.foto} 
                        alt={`${postulante.nombre} ${postulante.apellido}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800">
                            {postulante.nombre} {postulante.apellido}
                          </h4>
                          <p className="text-gray-600">{postulante.especialidad}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Award size={16} className="text-[#743fc6]" />
                          <span className="text-sm text-gray-700">{postulante.experiencia} años exp.</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star size={16} className="text-[#743fc6]" />
                          <span className="text-sm text-gray-700">{postulante.calificacion} ({postulante.serviciosCompletados} servicios)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-[#743fc6]" />
                          <span className="text-sm text-gray-700">{postulante.ubicacion}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign size={16} className="text-[#743fc6]" />
                          <span className="text-sm text-gray-700">{formatPrice(postulante.precio)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock size={14} />
                        <span>Disponibilidad: {postulante.disponibilidad}</span>
                        <span>•</span>
                        <span>Postulado: {postulante.fechaPostulacion}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 lg:flex-col">
                    <button className="px-4 py-2 bg-[#743fc6] text-white rounded-lg hover:bg-[#6a37b8] transition-all duration-200 flex items-center justify-center gap-2">
                      <UserCheck size={16} />
                      Elegir
                    </button>
                    <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 flex items-center justify-center gap-2">
                      <UserX size={16} />
                      Rechazar
                    </button>
                    <button 
                      onClick={() => handleVerPerfil(postulante.id)}
                      className="px-4 py-2 bg-[#fbbc6c] text-white rounded-lg hover:bg-[#f9b055] transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Eye size={16} />
                      Ver Perfil
                    </button>
                    <button 
                      onClick={() => handleVerPerfil(postulante.id)}
                      className="px-4 py-2 bg-[#743fc6] text-white rounded-lg hover:bg-[#6a37b8] transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <MessageSquare size={16} />
                      Mensaje
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 