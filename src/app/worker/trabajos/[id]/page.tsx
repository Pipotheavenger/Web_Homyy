'use client';
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  User,
  MessageCircle,
  Send,
  Star,
  Shield,
  CheckCircle,
  Phone,
  Mail,
  MessageSquare
} from 'lucide-react';
import Layout from '@/components/Layout';
import { useUserType } from '@/contexts/UserTypeContext';
import { ApplicationModal } from '@/components/ui/ApplicationModal';

interface TrabajoDetalle {
  id: string;
  titulo: string;
  descripcion: string;
  descripcionCompleta: string;
  precio: number;
  ubicacion: string;
  fecha: string;
  categoria: string;
  cliente: {
    nombre: string;
    verificado: boolean;
    telefono: string;
    email: string;
    calificacion: number;
    trabajosCompletados: number;
    fechaRegistro: string;
  };
  tiempoEstimado: string;
  requisitos: string[];
  materiales: string[];
  preguntas: Pregunta[];
}

interface Pregunta {
  id: string;
  pregunta: string;
  respuesta?: string;
  fecha: string;
  respondida: boolean;
}

export default function DetalleTrabajoPage() {
  const router = useRouter();
  const params = useParams();
  const { colors } = useUserType();
  const [nuevaPregunta, setNuevaPregunta] = useState('');
  const [preguntas, setPreguntas] = useState<Pregunta[]>([
    {
      id: '1',
      pregunta: '¿El cliente proporcionará los materiales de limpieza?',
      respuesta: 'Sí, tengo todos los materiales necesarios. Solo necesito que traigas tus herramientas especializadas.',
      fecha: 'Hace 2 horas',
      respondida: true
    },
    {
      id: '2',
      pregunta: '¿Hay estacionamiento disponible en el lugar?',
      respuesta: 'Sí, hay estacionamiento gratuito en el edificio.',
      fecha: 'Hace 1 hora',
      respondida: true
    },
    {
      id: '3',
      pregunta: '¿El trabajo incluye limpieza de ventanas exteriores?',
      fecha: 'Hace 30 minutos',
      respondida: false
    }
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Datos de ejemplo del trabajo
  const trabajo: TrabajoDetalle = {
    id: params.id as string,
    titulo: 'Limpieza Residencial Completa',
    descripcion: 'Limpieza profunda de casa de 3 habitaciones, 2 baños y cocina.',
    descripcionCompleta: 'Necesito una limpieza profunda y completa de mi apartamento. Incluye 3 habitaciones, 2 baños completos, cocina, sala y comedor. La casa tiene aproximadamente 120m². Es importante que se haga una limpieza detallada de las ventanas, pisos, baños y cocina. También necesito que se organice un poco el closet principal. Tengo mascotas (2 gatos) así que es importante que uses productos que no les afecten.',
    precio: 120000,
    ubicacion: 'Chapinero, Bogotá',
    fecha: '15 Oct 2024',
    categoria: 'Limpieza',
    cliente: {
      nombre: 'Ana Martínez',
      verificado: true,
      telefono: '+57 300 123 4567',
      email: 'ana.martinez@email.com',
      calificacion: 4.8,
      trabajosCompletados: 12,
      fechaRegistro: 'Enero 2024'
    },
    tiempoEstimado: '4-5 horas',
    requisitos: [
      'Experiencia en limpieza residencial',
      'Herramientas propias de limpieza',
      'Disponibilidad para el horario acordado',
      'Referencias verificables'
    ],
    materiales: [
      'Productos de limpieza (cliente proporciona)',
      'Aspiradora',
      'Escobas y trapeadores',
      'Paños de limpieza',
      'Guantes de trabajo'
    ]
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleEnviarPregunta = () => {
    if (nuevaPregunta.trim()) {
      const pregunta: Pregunta = {
        id: Date.now().toString(),
        pregunta: nuevaPregunta,
        fecha: 'Ahora',
        respondida: false
      };
      setPreguntas([pregunta, ...preguntas]);
      setNuevaPregunta('');
    }
  };

  const handleAplicar = () => {
    setIsModalOpen(true);
  };

  const handleSubmitApplication = (precio: number) => {
    // Aquí iría la lógica para enviar la aplicación con el precio
    console.log('Aplicación enviada con precio:', precio);
    router.push('/worker/trabajos');
  };

  return (
    <Layout currentPage="trabajos">
      <div className="p-4 md:p-6 space-y-6">
        {/* Header con botón de regreso */}
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-300"
          >
            <ArrowLeft size={20} />
            <span>Volver</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información principal del trabajo */}
          <div className="lg:col-span-2 space-y-6">
            {/* Detalles del trabajo */}
            <div className={`${colors.card} rounded-2xl p-6 border ${colors.border}`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    {trabajo.titulo}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <MapPin size={16} />
                      <span>{trabajo.ubicacion}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar size={16} />
                      <span>{trabajo.fecha}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock size={16} />
                      <span>{trabajo.tiempoEstimado}</span>
                    </div>
                  </div>
                </div>
                                 <div className="text-right">
                   <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                     <DollarSign size={24} className="text-white" />
                   </div>
                 </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Descripción del trabajo</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {trabajo.descripcionCompleta}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Requisitos</h4>
                    <ul className="space-y-1">
                      {trabajo.requisitos.map((requisito, index) => (
                        <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                          <CheckCircle size={14} className="text-green-500" />
                          <span>{requisito}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Materiales necesarios</h4>
                    <ul className="space-y-1">
                      {trabajo.materiales.map((material, index) => (
                        <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <span>{material}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Sección de preguntas */}
            <div className={`${colors.card} rounded-2xl p-6 border ${colors.border}`}>
              <div className="flex items-center space-x-2 mb-4">
                <MessageCircle size={20} className="text-orange-500" />
                <h3 className="text-lg font-semibold text-gray-800">Preguntas y respuestas</h3>
              </div>

              {/* Formulario para nueva pregunta */}
              <div className="mb-6">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Escribe tu pregunta sobre este trabajo..."
                    value={nuevaPregunta}
                    onChange={(e) => setNuevaPregunta(e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-300 outline-none"
                    onKeyPress={(e) => e.key === 'Enter' && handleEnviarPregunta()}
                  />
                  <button
                    onClick={handleEnviarPregunta}
                    disabled={!nuevaPregunta.trim()}
                    className="px-4 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>

              {/* Lista de preguntas */}
              <div className="space-y-4">
                {preguntas.map((pregunta) => (
                  <div key={pregunta.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <MessageSquare size={16} className="text-blue-500" />
                        <span className="text-sm font-medium text-gray-800">Tu pregunta</span>
                      </div>
                      <span className="text-xs text-gray-500">{pregunta.fecha}</span>
                    </div>
                    <p className="text-gray-700 mb-3">{pregunta.pregunta}</p>
                    
                    {pregunta.respondida && pregunta.respuesta && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <User size={16} className="text-green-600" />
                          <span className="text-sm font-medium text-green-800">Respuesta del cliente</span>
                        </div>
                        <p className="text-green-700 text-sm">{pregunta.respuesta}</p>
                      </div>
                    )}
                    
                    {!pregunta.respondida && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <Clock size={16} className="text-yellow-600" />
                          <span className="text-sm text-yellow-700">Esperando respuesta del cliente</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar con información del cliente */}
          <div className="space-y-6">
            {/* Información del cliente */}
            <div className={`${colors.card} rounded-2xl p-6 border ${colors.border}`}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {trabajo.cliente.nombre.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{trabajo.cliente.nombre}</h3>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} size={14} className="text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">{trabajo.cliente.calificacion}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Shield size={16} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Estado de verificación</p>
                    <p className="text-sm text-green-600 font-medium">
                      {trabajo.cliente.verificado ? 'Cuenta verificada' : 'No verificada'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CheckCircle size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Trabajos completados</p>
                    <p className="text-sm text-blue-600 font-medium">{trabajo.cliente.trabajosCompletados}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Calendar size={16} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Cliente desde</p>
                    <p className="text-sm text-purple-600 font-medium">{trabajo.cliente.fechaRegistro}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Información de contacto</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone size={14} />
                    <span>{trabajo.cliente.telefono}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail size={14} />
                    <span>{trabajo.cliente.email}</span>
                  </div>
                </div>
              </div>
            </div>

                         {/* Botón de aplicar */}
             <div className={`${colors.card} rounded-2xl p-6 border ${colors.border}`}>
               <button
                 onClick={handleAplicar}
                 className={`w-full py-3 ${colors.gradient} text-white rounded-xl font-semibold hover:opacity-80 transition-all duration-300`}
               >
                 Aplicar a este trabajo
               </button>
               <p className="text-xs text-gray-500 text-center mt-2">
                 Establece tu precio y envía tu aplicación
               </p>
             </div>
          </div>
                 </div>
       </div>

       {/* Modal de aplicación */}
       <ApplicationModal
         isOpen={isModalOpen}
         onClose={() => setIsModalOpen(false)}
         trabajo={{
           titulo: trabajo.titulo,
           descripcion: trabajo.descripcion
         }}
         onSubmit={handleSubmitApplication}
       />
     </Layout>
   );
 }
