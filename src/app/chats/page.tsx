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
import { useUserType } from '@/contexts/UserTypeContext';

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
  const { colors } = useUserType();
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
          texto: 'Hola, necesito reparar un grifo',
          esMio: true,
          timestamp: '08:15',
          leido: true,
          tipo: 'texto'
        },
        {
          id: '2',
          texto: 'Claro, ¿qué problema tiene?',
          esMio: false,
          timestamp: '08:20',
          leido: true,
          tipo: 'texto'
        },
        {
          id: '3',
          texto: 'El repuesto llegará mañana',
          esMio: false,
          timestamp: '09:00',
          leido: true,
          tipo: 'texto'
        }
      ]
    },
    {
      id: '3',
      profesional: 'María García',
      servicio: 'Organización de Closet',
      ultimoMensaje: '¿Te parece bien el precio?',
      timestamp: 'Hace 2 horas',
      noLeidos: 1,
      online: true,
      avatar: 'MG',
      mensajes: [
        {
          id: '1',
          texto: 'Hola, ¿te parece bien el precio?',
          esMio: false,
          timestamp: '07:30',
          leido: false,
          tipo: 'texto'
        }
      ]
    }
  ]);

  const conversacionSeleccionada = conversaciones.find(c => c.id === conversacionActiva);

  const filtrarConversaciones = () => {
    return conversaciones.filter(conv =>
      conv.profesional.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.servicio.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const enviarMensaje = () => {
    if (!nuevoMensaje.trim() || !conversacionActiva) return;

    const mensaje: Mensaje = {
      id: Date.now().toString(),
      texto: nuevoMensaje,
      esMio: true,
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      leido: false,
      tipo: 'texto'
    };

    setConversaciones(prev => prev.map(conv => {
      if (conv.id === conversacionActiva) {
        return {
          ...conv,
          mensajes: [...conv.mensajes, mensaje],
          ultimoMensaje: nuevoMensaje,
          timestamp: 'Ahora',
          noLeidos: 0
        };
      }
      return conv;
    }));

    setNuevoMensaje('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensaje();
    }
  };

  return (
    <Layout currentPage="chats">
      <div className="h-screen flex flex-col md:flex-row">
        {/* Lista de conversaciones */}
        <div className={`w-full md:w-1/3 ${colors.card} border-r ${colors.border} flex flex-col`}>
          {/* Header */}
          <div className={`p-4 border-b ${colors.border}`}>
            <div className="flex items-center space-x-3 mb-4">
              <div className={`w-10 h-10 ${colors.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                <MessageCircle size={20} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Chats</h2>
            </div>
            
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar conversaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm rounded-xl border border-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
          </div>

          {/* Lista de conversaciones */}
          <div className="flex-1 overflow-y-auto">
            {filtrarConversaciones().map((conversacion) => (
              <div
                key={conversacion.id}
                onClick={() => setConversacionActiva(conversacion.id)}
                className={`p-4 border-b border-gray-100/60 cursor-pointer transition-all duration-300 hover:bg-gray-50/80 ${
                  conversacionActiva === conversacion.id ? 'bg-purple-50/80 border-purple-200/60' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className={`w-12 h-12 ${colors.gradient} rounded-full flex items-center justify-center shadow-lg`}>
                      <span className="text-white font-bold text-sm">{conversacion.avatar}</span>
                    </div>
                    {conversacion.online && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-800 truncate">{conversacion.profesional}</h3>
                      <span className="text-xs text-gray-500">{conversacion.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{conversacion.servicio}</p>
                    <p className="text-sm text-gray-500 truncate">{conversacion.ultimoMensaje}</p>
                  </div>
                  
                  {conversacion.noLeidos > 0 && (
                    <div className={`w-6 h-6 ${colors.gradient} rounded-full flex items-center justify-center`}>
                      <span className="text-white text-xs font-bold">{conversacion.noLeidos}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Área de chat */}
        <div className="flex-1 flex flex-col hidden md:flex">
          {conversacionSeleccionada ? (
            <>
              {/* Header del chat */}
              <div className={`p-4 border-b ${colors.border} ${colors.card}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setConversacionActiva(null)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 rounded-lg transition-all duration-300"
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <div className={`w-10 h-10 ${colors.gradient} rounded-full flex items-center justify-center shadow-lg`}>
                      <span className="text-white font-bold text-sm">{conversacionSeleccionada.avatar}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{conversacionSeleccionada.profesional}</h3>
                      <p className="text-sm text-gray-600">{conversacionSeleccionada.servicio}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 rounded-lg transition-all duration-300">
                      <Phone size={18} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 rounded-lg transition-all duration-300">
                      <Video size={18} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 rounded-lg transition-all duration-300">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Mensajes */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
                <div className="space-y-4">
                  {conversacionSeleccionada.mensajes.map((mensaje) => (
                    <div
                      key={mensaje.id}
                      className={`flex ${mensaje.esMio ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                        mensaje.esMio 
                          ? `${colors.gradient} text-white` 
                          : 'bg-white shadow-sm border border-gray-200 text-gray-800'
                      }`}>
                        <p className="text-sm">{mensaje.texto}</p>
                        <div className={`flex items-center justify-end space-x-1 mt-2 ${
                          mensaje.esMio ? 'text-white/80' : 'text-gray-500'
                        }`}>
                          <span className="text-xs">{mensaje.timestamp}</span>
                          {mensaje.esMio && (
                            <span className="text-xs">
                              {mensaje.leido ? <CheckCheck size={12} /> : <Check size={12} />}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Input de mensaje */}
              <div className={`p-4 border-t ${colors.border} ${colors.card}`}>
                <div className="flex items-center space-x-3">
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 rounded-lg transition-all duration-300">
                    <Paperclip size={20} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 rounded-lg transition-all duration-300">
                    <Image size={20} />
                  </button>
                  
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Escribe un mensaje..."
                      value={nuevoMensaje}
                      onChange={(e) => setNuevoMensaje(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm rounded-xl border border-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>
                  
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 rounded-lg transition-all duration-300">
                    <Smile size={20} />
                  </button>
                  <button
                    onClick={enviarMensaje}
                    disabled={!nuevoMensaje.trim()}
                    className={`p-3 rounded-xl transition-all duration-300 ${
                      nuevoMensaje.trim()
                        ? `${colors.gradient} text-white hover:opacity-80`
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Estado vacío */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className={`w-20 h-20 ${colors.gradient} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <MessageCircle size={32} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Selecciona una conversación</h3>
                <p className="text-gray-600">Elige una conversación para comenzar a chatear</p>
              </div>
            </div>
          )}
        </div>

        {/* Vista móvil para conversación seleccionada */}
        {conversacionSeleccionada && (
          <div className="md:hidden fixed inset-0 z-50 bg-white">
            {/* Header móvil */}
            <div className={`p-4 border-b ${colors.border} ${colors.card}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setConversacionActiva(null)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 rounded-lg transition-all duration-300"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <div className={`w-10 h-10 ${colors.gradient} rounded-full flex items-center justify-center shadow-lg`}>
                    <span className="text-white font-bold text-sm">{conversacionSeleccionada.avatar}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{conversacionSeleccionada.profesional}</h3>
                    <p className="text-sm text-gray-600">{conversacionSeleccionada.servicio}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mensajes móviles */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
              <div className="space-y-4">
                {conversacionSeleccionada.mensajes.map((mensaje) => (
                  <div
                    key={mensaje.id}
                    className={`flex ${mensaje.esMio ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs px-4 py-3 rounded-2xl ${
                      mensaje.esMio 
                        ? `${colors.gradient} text-white` 
                        : 'bg-white shadow-sm border border-gray-200 text-gray-800'
                    }`}>
                      <p className="text-sm">{mensaje.texto}</p>
                      <div className={`flex items-center justify-end space-x-1 mt-2 ${
                        mensaje.esMio ? 'text-white/80' : 'text-gray-500'
                      }`}>
                        <span className="text-xs">{mensaje.timestamp}</span>
                        {mensaje.esMio && (
                          <span className="text-xs">
                            {mensaje.leido ? <CheckCheck size={12} /> : <Check size={12} />}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Input móvil */}
            <div className={`p-4 border-t ${colors.border} ${colors.card}`}>
              <div className="flex items-center space-x-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Escribe un mensaje..."
                    value={nuevoMensaje}
                    onChange={(e) => setNuevoMensaje(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm rounded-xl border border-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
                <button
                  onClick={enviarMensaje}
                  disabled={!nuevoMensaje.trim()}
                  className={`p-3 rounded-xl transition-all duration-300 ${
                    nuevoMensaje.trim()
                      ? `${colors.gradient} text-white hover:opacity-80`
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
} 