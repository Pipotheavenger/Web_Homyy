'use client';
import { useState } from 'react';
import { 
  MessageCircle,
  Search,
  Send,
  MoreVertical,
  Phone,
  Video,
  Image,
  Paperclip,
  Smile,
  User,
  Clock,
  Check,
  CheckCheck,
  ArrowLeft
} from 'lucide-react';
import Layout from '@/components/Layout';

interface Mensaje {
  id: string;
  texto: string;
  esMio: boolean;
  timestamp: string;
  leido: boolean;
  tipo: 'texto' | 'imagen' | 'documento';
}

interface Conversacion {
  id: string;
  profesional: string;
  servicio: string;
  ultimoMensaje: string;
  timestamp: string;
  noLeidos: number;
  online: boolean;
  avatar: string;
  mensajes: Mensaje[];
}

export default function ChatsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [conversacionActiva, setConversacionActiva] = useState<string | null>(null);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([
    {
      id: '1',
      profesional: 'Ana Martínez',
      servicio: 'Limpieza Residencial',
      ultimoMensaje: 'Perfecto, estaré ahí a las 9:00 AM',
      timestamp: 'Hace 5 min',
      noLeidos: 2,
      online: true,
      avatar: 'AM',
      mensajes: [
        {
          id: '1',
          texto: 'Hola, ¿estás disponible para mañana?',
          esMio: true,
          timestamp: '09:30',
          leido: true,
          tipo: 'texto'
        },
        {
          id: '2',
          texto: '¡Hola! Sí, tengo disponibilidad mañana',
          esMio: false,
          timestamp: '09:32',
          leido: true,
          tipo: 'texto'
        },
        {
          id: '3',
          texto: 'Perfecto, ¿a qué hora podrías venir?',
          esMio: true,
          timestamp: '09:33',
          leido: true,
          tipo: 'texto'
        },
        {
          id: '4',
          texto: 'Perfecto, estaré ahí a las 9:00 AM',
          esMio: false,
          timestamp: '09:35',
          leido: false,
          tipo: 'texto'
        }
      ]
    },
    {
      id: '2',
      profesional: 'Carlos López',
      servicio: 'Reparación de Grifo',
      ultimoMensaje: 'El repuesto llegará mañana',
      timestamp: 'Hace 1 hora',
      noLeidos: 0,
      online: false,
      avatar: 'CL',
      mensajes: [
        {
          id: '1',
          texto: '¿Cuándo llegará el repuesto?',
          esMio: true,
          timestamp: '08:15',
          leido: true,
          tipo: 'texto'
        },
        {
          id: '2',
          texto: 'El repuesto llegará mañana',
          esMio: false,
          timestamp: '08:20',
          leido: true,
          tipo: 'texto'
        }
      ]
    },
    {
      id: '3',
      profesional: 'Laura Rodríguez',
      servicio: 'Organización de Closet',
      ultimoMensaje: 'Gracias por el servicio',
      timestamp: 'Ayer',
      noLeidos: 0,
      online: true,
      avatar: 'LR',
      mensajes: [
        {
          id: '1',
          texto: 'El closet quedó perfecto',
          esMio: false,
          timestamp: '16:30',
          leido: true,
          tipo: 'texto'
        },
        {
          id: '2',
          texto: 'Gracias por el servicio',
          esMio: false,
          timestamp: '16:32',
          leido: true,
          tipo: 'texto'
        }
      ]
    },
    {
      id: '4',
      profesional: 'Roberto Hernández',
      servicio: 'Instalación de Ventilador',
      ultimoMensaje: '¿Necesitas algo más?',
      timestamp: 'Hace 2 días',
      noLeidos: 0,
      online: false,
      avatar: 'RH',
      mensajes: [
        {
          id: '1',
          texto: '¿Necesitas algo más?',
          esMio: false,
          timestamp: '14:20',
          leido: true,
          tipo: 'texto'
        }
      ]
    }
  ]);

  const conversacionActual = conversaciones.find(c => c.id === conversacionActiva);

  const enviarMensaje = () => {
    if (!nuevoMensaje.trim() || !conversacionActiva) return;

    const mensaje: Mensaje = {
      id: Date.now().toString(),
      texto: nuevoMensaje,
      esMio: true,
      timestamp: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
      leido: false,
      tipo: 'texto'
    };

    setConversaciones(prev => 
      prev.map(conv => 
        conv.id === conversacionActiva 
          ? { 
              ...conv, 
              mensajes: [...conv.mensajes, mensaje],
              ultimoMensaje: nuevoMensaje,
              timestamp: 'Ahora',
              noLeidos: 0
            }
          : conv
      )
    );

    setNuevoMensaje('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensaje();
    }
  };

  const filteredConversaciones = conversaciones.filter(conversacion =>
    conversacion.profesional.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversacion.servicio.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout title="Chats" currentPage="chats">
      <div className="h-[calc(100vh-120px)] flex">
        {/* Lista de conversaciones */}
        <div className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Header de conversaciones */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Conversaciones</h2>
              <button className="p-2 text-gray-400 hover:text-[#743fc6] hover:bg-[#743fc6]/10 rounded-lg transition-colors">
                <MoreVertical size={20} />
              </button>
            </div>
            
            {/* Búsqueda */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={20} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar conversaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-[#743fc6]/20 focus:border-[#743fc6]"
              />
            </div>
          </div>

          {/* Lista de conversaciones */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversaciones.length > 0 ? (
              filteredConversaciones.map((conversacion) => (
                <div
                  key={conversacion.id}
                  onClick={() => setConversacionActiva(conversacion.id)}
                  className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                    conversacionActiva === conversacion.id 
                      ? 'bg-[#743fc6]/10 border-l-4 border-l-[#743fc6]' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#743fc6] to-[#8a5fd1] rounded-full flex items-center justify-center text-white font-semibold">
                        {conversacion.avatar}
                      </div>
                                             <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                         conversacion.online ? 'bg-green-500' : 'bg-gray-400'
                       }`}></div>
                    </div>

                    {/* Información de la conversación */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-800 truncate">
                          {conversacion.profesional}
                        </h3>
                        <span className="text-xs text-gray-500">{conversacion.timestamp}</span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-1 truncate">
                        {conversacion.servicio}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500 truncate">
                          {conversacion.ultimoMensaje}
                        </p>
                        {conversacion.noLeidos > 0 && (
                          <div className="ml-2 w-5 h-5 bg-[#743fc6] rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              {conversacion.noLeidos}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <MessageCircle size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No se encontraron conversaciones</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat activo */}
        <div className="flex-1 bg-gray-50 flex flex-col">
          {conversacionActiva && conversacionActual ? (
            <>
              {/* Header del chat */}
              <div className="bg-white border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-r from-[#743fc6] to-[#8a5fd1] rounded-full flex items-center justify-center text-white font-semibold">
                        {conversacionActual.avatar}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                        conversacionActual.online ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{conversacionActual.profesional}</h3>
                      <p className="text-sm text-gray-600">{conversacionActual.servicio}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-[#743fc6] hover:bg-[#743fc6]/10 rounded-lg transition-colors">
                      <Phone size={20} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-[#743fc6] hover:bg-[#743fc6]/10 rounded-lg transition-colors">
                      <Video size={20} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-[#743fc6] hover:bg-[#743fc6]/10 rounded-lg transition-colors">
                      <MoreVertical size={20} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Mensajes */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {conversacionActual.mensajes.map((mensaje) => (
                  <div
                    key={mensaje.id}
                    className={`flex ${mensaje.esMio ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      mensaje.esMio 
                        ? 'bg-[#743fc6] text-white' 
                        : 'bg-white text-gray-800 border border-gray-200'
                    }`}>
                      <p className="text-sm">{mensaje.texto}</p>
                      <div className={`flex items-center justify-end space-x-1 mt-1 ${
                        mensaje.esMio ? 'text-white/70' : 'text-gray-500'
                      }`}>
                        <span className="text-xs">{mensaje.timestamp}</span>
                        {mensaje.esMio && (
                          mensaje.leido ? (
                            <CheckCheck size={12} />
                          ) : (
                            <Check size={12} />
                          )
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input de mensaje */}
              <div className="bg-white border-t border-gray-200 p-4">
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-[#743fc6] hover:bg-[#743fc6]/10 rounded-lg transition-colors">
                    <Paperclip size={20} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-[#743fc6] hover:bg-[#743fc6]/10 rounded-lg transition-colors">
                    <Image size={20} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-[#743fc6] hover:bg-[#743fc6]/10 rounded-lg transition-colors">
                    <Smile size={20} />
                  </button>
                  
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Escribe un mensaje..."
                      value={nuevoMensaje}
                      onChange={(e) => setNuevoMensaje(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#743fc6]/20 focus:border-[#743fc6]"
                    />
                  </div>
                  
                  <button
                    onClick={enviarMensaje}
                    disabled={!nuevoMensaje.trim()}
                    className="p-2 bg-[#743fc6] text-white rounded-full hover:bg-[#6a37b8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle size={64} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">Selecciona una conversación</h3>
                <p className="text-gray-600">Elige una conversación para comenzar a chatear</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
} 