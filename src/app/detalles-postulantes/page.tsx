'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Calendar,
  MapPin,
  Clock,
  Star,
  ChevronRight,
  X,
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
import Layout from '@/components/Layout';

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

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'aprobado':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rechazado':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'aprobado':
        return <UserCheck size={16} />;
      case 'rechazado':
        return <UserX size={16} />;
      default:
        return <UserPlus size={16} />;
    }
  };

  const handleVerPerfil = (profesionalId: string) => {
    router.push(`/perfil-profesional?id=${profesionalId}`);
  };

  const filteredPostulantes = postulantes.filter(postulante => {
    if (selectedFilter === 'todos') return true;
    return postulante.estado === selectedFilter;
  });

  return (
    <Layout title="Detalles de Postulantes" showBackButton={true}>
      <div className="p-6">
        {/* Información del servicio */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">{servicio.titulo}</h1>
              <p className="text-gray-600 mb-4">{servicio.descripcion}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <MapPin size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-600">{servicio.ubicacion}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-600">Presupuesto: {formatPrice(servicio.presupuesto)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-600">{servicio.postulantes} postulantes</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getEstadoColor(servicio.estado)}`}>
                {servicio.estado === 'activo' ? 'Activo' : servicio.estado === 'en_proceso' ? 'En Proceso' : 'Completado'}
              </div>
            </div>
          </div>

          {/* Progreso */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progreso</span>
              <span className="text-sm text-gray-500">{servicio.progreso}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-[#743fc6] to-[#8a5fd1] h-2 rounded-full transition-all duration-300"
                style={{ width: `${servicio.progreso}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-1">{servicio.etapa}</p>
          </div>

          {/* Horarios de disponibilidad */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Horarios de Disponibilidad</h3>
            <div className="space-y-1">
              {servicio.horariosDisponibilidad.map((horario, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock size={14} />
                  <span>{horario}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filtros y ordenamiento */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter size={16} className="text-gray-500" />
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#743fc6]/20 focus:border-[#743fc6] outline-none"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="pendiente">Pendientes</option>
                  <option value="aprobado">Aprobados</option>
                  <option value="rechazado">Rechazados</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <SortAsc size={16} className="text-gray-500" />
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#743fc6]/20 focus:border-[#743fc6] outline-none"
                >
                  <option value="reciente">Más recientes</option>
                  <option value="experiencia">Más experiencia</option>
                  <option value="calificacion">Mejor calificación</option>
                  <option value="precio">Menor precio</option>
                </select>
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              {filteredPostulantes.length} postulante{filteredPostulantes.length !== 1 ? 's' : ''} encontrado{filteredPostulantes.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Lista de postulantes */}
        <div className="space-y-4">
          {filteredPostulantes.map((postulante) => (
            <div key={postulante.id} className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="flex items-start space-x-4">
                {/* Foto del postulante */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden">
                    <img
                      src={postulante.foto}
                      alt={`${postulante.nombre} ${postulante.apellido}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Información del postulante */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">
                        {postulante.nombre} {postulante.apellido}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">{postulante.especialidad}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <CalendarDays size={14} />
                          <span>{postulante.experiencia} años</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users size={14} />
                          <span>{postulante.serviciosCompletados} servicios</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin size={14} />
                          <span>{postulante.ubicacion}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getEstadoColor(postulante.estado)}`}>
                        {getEstadoIcon(postulante.estado)}
                        <span className="ml-1">
                          {postulante.estado === 'pendiente' ? 'Pendiente' : 
                           postulante.estado === 'aprobado' ? 'Aprobado' : 'Rechazado'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Calificación y precio */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        {renderStars(postulante.calificacion)}
                      </div>
                      <span className="text-sm font-medium text-gray-700">{postulante.calificacion}</span>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-bold text-[#743fc6]">{formatPrice(postulante.precio)}</p>
                      <p className="text-xs text-gray-500">{postulante.disponibilidad}</p>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleVerPerfil(postulante.id)}
                        className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-[#743fc6] hover:bg-[#743fc6]/10 rounded-lg transition-all duration-200"
                      >
                        <Eye size={14} />
                        <span>Ver Perfil</span>
                      </button>
                      
                      <button className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200">
                        <MessageSquare size={14} />
                        <span>Mensaje</span>
                      </button>
                      
                      <button className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200">
                        <PhoneCall size={14} />
                        <span>Llamar</span>
                      </button>
                    </div>

                    <div className="text-xs text-gray-500">
                      Postulado {postulante.fechaPostulacion}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
} 