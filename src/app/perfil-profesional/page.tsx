'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  ArrowLeft
} from 'lucide-react';
import Layout from '@/components/Layout';

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
        comentario: 'Buen servicio, muy organizada y puntual. Recomendada.',
        fecha: 'Hace 2 semanas',
        servicio: 'Organización de Closets'
      },
      {
        id: '4',
        cliente: 'Roberto Jiménez',
        calificacion: 5,
        comentario: 'Excelente profesional. Mi oficina quedó perfecta después de la limpieza.',
        fecha: 'Hace 3 semanas',
        servicio: 'Limpieza General Residencial'
      }
    ],
    foto: '/api/placeholder/200/200'
  });

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

  return (
    <Layout title="Perfil Profesional" showBackButton={true}>
      <div className="p-6">
        {/* Header con figura morada y foto circular */}
        <div className="relative mb-8">
          {/* Figura morada superior */}
          <div className="relative h-48 bg-gradient-to-r from-[#743fc6] to-[#8a5fd1] rounded-2xl overflow-hidden">
            {/* Onda SVG */}
            <svg
              className="absolute bottom-0 left-0 w-full h-16"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
            >
              <path
                d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
                opacity=".25"
                fill="#ffffff"
              />
              <path
                d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
                opacity=".5"
                fill="#ffffff"
              />
              <path
                d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
                fill="#ffffff"
              />
            </svg>
            
            {/* Información del profesional */}
            <div className="absolute bottom-4 left-6 right-6 text-white">
              <div className="flex items-end justify-between">
                <div className="flex items-end space-x-4">
                  {/* Foto circular */}
                  <div className="relative">
                    <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                      <img
                        src={profesional.foto}
                        alt={`${profesional.nombre} ${profesional.apellido}`}
                        className="w-28 h-28 rounded-full object-cover"
                      />
                    </div>
                  </div>
                  
                  {/* Información básica */}
                  <div className="mb-2">
                    <h1 className="text-2xl font-bold mb-1">
                      {profesional.nombre} {profesional.apellido}
                    </h1>
                    <p className="text-lg opacity-90 mb-2">{profesional.especialidad}</p>
                    
                    {/* Estadísticas */}
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-[#fbbc6c] rounded-lg flex items-center justify-center">
                          <CalendarDays size={16} className="text-white" />
                        </div>
                        <div>
                          <p className="text-sm opacity-75">Años de experiencia</p>
                          <p className="font-semibold">{profesional.experiencia} años</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-[#fbbc6c] rounded-lg flex items-center justify-center">
                          <Users size={16} className="text-white" />
                        </div>
                        <div>
                          <p className="text-sm opacity-75">Servicios completados</p>
                          <p className="font-semibold">{profesional.serviciosCompletados}</p>
                        </div>
                      </div>
                      
                      {/* Calificación */}
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          {renderStars(profesional.calificacion)}
                        </div>
                        <span className="font-semibold">{profesional.calificacion}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Columna izquierda - Detalles del profesional */}
          <div className="lg:col-span-2 space-y-6">
            {/* Detalles del profesional */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Detalles del Profesional</h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">{profesional.descripcion}</p>
                
                {/* Ubicación */}
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin size={16} />
                  <span>{profesional.ubicacion}</span>
                </div>
              </div>
            </div>

            {/* Trabajos recientes */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Trabajos Recientes</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {profesional.trabajosRecientes.map((trabajo) => (
                  <div key={trabajo.id} className="bg-gray-50 rounded-xl p-4">
                    <div className="aspect-video bg-gray-200 rounded-lg mb-3 overflow-hidden">
                      <img
                        src={trabajo.imagen}
                        alt={trabajo.titulo}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-1">{trabajo.titulo}</h3>
                    <p className="text-sm text-gray-600 mb-2">{trabajo.descripcion}</p>
                    <p className="text-xs text-gray-500">{trabajo.fecha}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Reseñas */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Reseñas</h2>
              <div className="space-y-4">
                {profesional.reseñas.map((reseña) => (
                  <div key={reseña.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-800">{reseña.cliente}</h4>
                        <p className="text-sm text-gray-600">{reseña.servicio}</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        {renderStars(reseña.calificacion)}
                      </div>
                    </div>
                    <p className="text-gray-700 mb-2">{reseña.comentario}</p>
                    <p className="text-xs text-gray-500">{reseña.fecha}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Columna derecha - Servicios */}
          <div className="space-y-6">
            {/* Servicios ofrecidos */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Servicios Ofrecidos</h2>
              <div className="space-y-4">
                {profesional.servicios.map((servicio) => (
                  <div key={servicio.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="aspect-video bg-gray-200 rounded-lg mb-3 overflow-hidden">
                      <img
                        src={servicio.imagen}
                        alt={servicio.nombre}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2">{servicio.nombre}</h3>
                    <p className="text-sm text-gray-600 mb-3">{servicio.descripcion}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock size={14} />
                        <span>{servicio.duracion}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[#743fc6]">{formatPrice(servicio.precio)}</p>
                        <p className="text-xs text-gray-500">
                          {servicio.disponible ? 'Disponible' : 'No disponible'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 