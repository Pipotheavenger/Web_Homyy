'use client';
import { useState, useEffect, useRef } from 'react';
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
  Trash2
} from 'lucide-react';

interface Horario {
  id: string;
  fecha: string;
  horaInicio: string;
  horaFinal: string;
}

export default function CrearServicioPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    ciudad: '',
    barrio: ''
  });
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFinal, setHoraFinal] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showClockInicio, setShowClockInicio] = useState(false);
  const [showClockFinal, setShowClockFinal] = useState(false);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const clockInicioRef = useRef<HTMLDivElement>(null);
  const clockFinalRef = useRef<HTMLDivElement>(null);

  // Generar horas con intervalos de media hora
  const generarHoras = () => {
    const horas = [];
    for (let hora = 0; hora < 24; hora++) {
      for (let minuto = 0; minuto < 60; minuto += 30) {
        const horaStr = hora.toString().padStart(2, '0');
        const minutoStr = minuto.toString().padStart(2, '0');
        horas.push(`${horaStr}:${minutoStr}`);
      }
    }
    return horas;
  };

  const horasDisponibles = generarHoras();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Cerrar relojes cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (clockInicioRef.current && !clockInicioRef.current.contains(event.target as Node)) {
        setShowClockInicio(false);
      }
      if (clockFinalRef.current && !clockFinalRef.current.contains(event.target as Node)) {
        setShowClockFinal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simular envío del formulario
    setTimeout(() => {
      setIsLoading(false);
      router.push('/dashboard');
    }, 2000);
  };

  const handleBack = () => {
    router.back();
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Funciones para el calendario
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Días vacíos al inicio
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
    }

    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const currentDateString = currentDate.toISOString().split('T')[0];
      const isSelected = fechaSeleccionada === currentDateString;
      
      days.push(
        <button
          key={day}
          onClick={() => {
            setFechaSeleccionada(currentDateString);
          }}
          className={`w-8 h-8 rounded-full text-sm font-medium transition-all duration-200 ${
            isSelected 
              ? 'bg-[#743fc6] text-white' 
              : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  // Funciones para manejar horarios
  const agregarHorario = () => {
    if (!fechaSeleccionada || !horaInicio || !horaFinal) {
      alert('Por favor selecciona una fecha y horario completo');
      return;
    }

    if (horaInicio >= horaFinal) {
      alert('La hora de inicio debe ser menor que la hora final');
      return;
    }

    const nuevoHorario: Horario = {
      id: Date.now().toString(),
      fecha: fechaSeleccionada,
      horaInicio,
      horaFinal
    };

    setHorarios(prev => [...prev, nuevoHorario]);
    setHoraInicio('');
    setHoraFinal('');
  };

  const eliminarHorario = (id: string) => {
    setHorarios(prev => prev.filter(horario => horario.id !== id));
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderTimeSelector = (type: 'inicio' | 'final') => {
    const currentTime = type === 'inicio' ? horaInicio : horaFinal;
    const showSelector = type === 'inicio' ? showClockInicio : showClockFinal;
    
    if (!showSelector) return null;

    const handleTimeSelect = (time: string) => {
      if (type === 'inicio') {
        setHoraInicio(time);
        setShowClockInicio(false);
      } else {
        setHoraFinal(time);
        setShowClockFinal(false);
      }
    };

    return (
      <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg p-4 z-50 w-full max-w-sm">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-sm font-medium text-gray-700">
            Seleccionar {type === 'inicio' ? 'hora de inicio' : 'hora final'}
          </h4>
          <button
            onClick={() => type === 'inicio' ? setShowClockInicio(false) : setShowClockFinal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        </div>
        
        {/* Lista de horas con intervalos de media hora */}
        <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
          <div className="grid grid-cols-2 gap-1 p-2">
            {horasDisponibles.map((hora) => (
              <button
                key={hora}
                onClick={() => handleTimeSelect(hora)}
                className={`p-2 text-sm rounded-lg transition-all duration-200 ${
                  currentTime === hora
                    ? 'bg-[#7d4ccb] text-white'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                {hora}
              </button>
            ))}
          </div>
        </div>

        {/* Hora seleccionada */}
        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg text-center">
          <p className="text-sm font-medium text-gray-700 mb-1">
            Hora seleccionada:
          </p>
          <p className="text-lg font-bold text-[#7d4ccb]">
            {currentTime || 'No seleccionada'}
          </p>
        </div>
      </div>
    );
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
              <h1 className="text-2xl font-bold text-gray-800">Crear Servicio</h1>
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
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Form - Left Column */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Detalles del Servicio</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Título del Servicio */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Título del Servicio
                    </label>
                    <div className="relative">
                      <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-all duration-300 ${focusedField === 'titulo' ? 'text-[#743fc6] scale-110' : 'text-gray-400'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        placeholder="Ej: Limpieza general de casa"
                        value={formData.titulo}
                        onChange={(e) => handleInputChange('titulo', e.target.value)}
                        onFocus={() => setFocusedField('titulo')}
                        onBlur={() => setFocusedField(null)}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all duration-300 bg-white placeholder-gray-400 font-medium ${focusedField === 'titulo' ? 'border-[#743fc6] focus:ring-[#743fc6]/20' : 'border-gray-200 hover:border-gray-300'} focus:ring-4 focus:outline-none`}
                      />
                    </div>
                  </div>

                  {/* Descripción */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Descripción
                    </label>
                    <div className="relative">
                      <div className={`absolute left-3 top-3 transition-all duration-300 ${focusedField === 'descripcion' ? 'text-[#743fc6] scale-110' : 'text-gray-400'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <textarea
                        placeholder="Describe detalladamente el servicio que necesitas..."
                        value={formData.descripcion}
                        onChange={(e) => handleInputChange('descripcion', e.target.value)}
                        onFocus={() => setFocusedField('descripcion')}
                        onBlur={() => setFocusedField(null)}
                        rows={4}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all duration-300 bg-white placeholder-gray-400 font-medium resize-none ${focusedField === 'descripcion' ? 'border-[#743fc6] focus:ring-[#743fc6]/20' : 'border-gray-200 hover:border-gray-300'} focus:ring-4 focus:outline-none`}
                      />
                    </div>
                  </div>

                  {/* Ciudad y Barrio en fila */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Ciudad */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Ciudad
                      </label>
                      <div className="relative">
                        <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-all duration-300 ${focusedField === 'ciudad' ? 'text-[#743fc6] scale-110' : 'text-gray-400'}`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          placeholder="Bogotá"
                          value={formData.ciudad}
                          onChange={(e) => handleInputChange('ciudad', e.target.value)}
                          onFocus={() => setFocusedField('ciudad')}
                          onBlur={() => setFocusedField(null)}
                          className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all duration-300 bg-white placeholder-gray-400 font-medium ${focusedField === 'ciudad' ? 'border-[#743fc6] focus:ring-[#743fc6]/20' : 'border-gray-200 hover:border-gray-300'} focus:ring-4 focus:outline-none`}
                        />
                      </div>
                    </div>

                    {/* Barrio */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Barrio
                      </label>
                      <div className="relative">
                        <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-all duration-300 ${focusedField === 'barrio' ? 'text-[#743fc6] scale-110' : 'text-gray-400'}`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          placeholder="Chapinero"
                          value={formData.barrio}
                          onChange={(e) => handleInputChange('barrio', e.target.value)}
                          onFocus={() => setFocusedField('barrio')}
                          onBlur={() => setFocusedField(null)}
                          className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all duration-300 bg-white placeholder-gray-400 font-medium ${focusedField === 'barrio' ? 'border-[#743fc6] focus:ring-[#743fc6]/20' : 'border-gray-200 hover:border-gray-300'} focus:ring-4 focus:outline-none`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Botón Crear Servicio */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-4 bg-gradient-to-r from-[#743fc6] to-[#8a5fd1] text-white rounded-xl font-semibold hover:from-[#8a5fd1] hover:to-[#743fc6] transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                      <div className="flex items-center justify-center gap-2">
                        {isLoading && (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        )}
                        <span className="font-medium">Crear Servicio</span>
                      </div>
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Right Sidebar - Calendar */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Disponibilidad</h3>
                
                {/* Calendar */}
                <div className="space-y-4">
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={prevMonth}
                      className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronLeft size={20} className="text-gray-600" />
                    </button>
                    <h4 className="text-lg font-semibold text-gray-800 capitalize">
                      {formatMonth(currentMonth)}
                    </h4>
                    <button
                      onClick={nextMonth}
                      className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronRight size={20} className="text-gray-600" />
                    </button>
                  </div>

                  {/* Days of Week */}
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
                      <div key={day} className="text-xs font-medium text-gray-500 py-1">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days */}
                  <div className="grid grid-cols-7 gap-1">
                    {renderCalendar()}
                  </div>

                  {/* Selected Date Display */}
                  {fechaSeleccionada && (
                    <div className="mt-4 p-3 bg-[#743fc6]/10 border border-[#743fc6]/20 rounded-lg">
                      <p className="text-sm font-medium text-[#743fc6]">
                        Fecha seleccionada:
                      </p>
                      <p className="text-sm text-gray-700">
                        {new Date(fechaSeleccionada).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>

                             {/* Horario Section */}
               <div className="bg-white rounded-2xl shadow-sm border p-6">
                 <div className="flex items-center space-x-2 mb-4">
                   <div className="w-8 h-8 bg-[#7d4ccb] rounded-lg flex items-center justify-center">
                     <Clock size={20} className="text-white" />
                   </div>
                   <h3 className="text-xl font-bold text-[#7d4ccb]">Horario de Disponibilidad</h3>
                 </div>
                 
                 {/* Fecha seleccionada info */}
                 {fechaSeleccionada && (
                   <div className="mb-4 p-3 bg-[#743fc6]/10 border border-[#743fc6]/20 rounded-lg">
                     <p className="text-sm font-medium text-[#743fc6] mb-1">
                       Fecha seleccionada:
                     </p>
                     <p className="text-sm text-gray-700">
                       {new Date(fechaSeleccionada).toLocaleDateString('es-ES', {
                         weekday: 'long',
                         year: 'numeric',
                         month: 'long',
                         day: 'numeric'
                       })}
                     </p>
                   </div>
                 )}

                 {/* Selector de Horarios */}
                 <div className="space-y-4">
                   {/* Hora de Inicio */}
                   <div className="space-y-2">
                     <label className="block text-sm font-medium text-gray-700">
                       Hora de Inicio
                     </label>
                     <div className="relative" ref={clockInicioRef}>
                       <button
                         type="button"
                         onClick={() => setShowClockInicio(!showClockInicio)}
                         className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all duration-300 bg-white font-medium text-left ${
                           horaInicio 
                             ? 'border-[#743fc6] text-gray-700' 
                             : 'border-gray-200 hover:border-gray-300 text-gray-400'
                         } focus:ring-4 focus:ring-[#743fc6]/20 focus:outline-none`}
                       >
                         <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                           </svg>
                         </div>
                         {horaInicio || 'Seleccionar hora'}
                         <div className="absolute right-3 top-1/2 -translate-y-1/2">
                           <ChevronDown size={16} className="text-gray-400" />
                         </div>
                       </button>
                       {renderTimeSelector('inicio')}
                     </div>
                   </div>

                   {/* Hora Final */}
                   <div className="space-y-2">
                     <label className="block text-sm font-medium text-gray-700">
                       Hora Final
                     </label>
                     <div className="relative" ref={clockFinalRef}>
                       <button
                         type="button"
                         onClick={() => setShowClockFinal(!showClockFinal)}
                         className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all duration-300 bg-white font-medium text-left ${
                           horaFinal 
                             ? 'border-[#743fc6] text-gray-700' 
                             : 'border-gray-200 hover:border-gray-300 text-gray-400'
                         } focus:ring-4 focus:ring-[#743fc6]/20 focus:outline-none`}
                       >
                         <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                           </svg>
                         </div>
                         {horaFinal || 'Seleccionar hora'}
                         <div className="absolute right-3 top-1/2 -translate-y-1/2">
                           <ChevronDown size={16} className="text-gray-400" />
                         </div>
                       </button>
                       {renderTimeSelector('final')}
                     </div>
                   </div>



                   {/* Botón para agregar horario */}
                   <div className="mt-4">
                     <button
                       type="button"
                       onClick={agregarHorario}
                       className="w-full py-3 bg-[#7d4ccb] text-white rounded-xl font-medium hover:bg-[#6a3db8] transition-all duration-300 flex items-center justify-center gap-2"
                     >
                       <Plus size={16} />
                       Agregar Horario
                     </button>
                   </div>

                   {/* Lista de horarios guardados */}
                   {horarios.length > 0 && (
                     <div className="mt-6">
                       <h4 className="text-sm font-medium text-gray-700 mb-3">Horarios guardados:</h4>
                       <div className="space-y-2">
                         {horarios.map((horario) => (
                           <div
                             key={horario.id}
                             className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
                           >
                             <div className="flex-1">
                               <p className="text-sm font-medium text-gray-800">
                                 {formatFecha(horario.fecha)}
                               </p>
                               <p className="text-xs text-gray-600">
                                 {horario.horaInicio} - {horario.horaFinal}
                               </p>
                             </div>
                             <button
                               onClick={() => eliminarHorario(horario.id)}
                               className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                               title="Eliminar horario"
                             >
                               <Trash2 size={16} />
                             </button>
                           </div>
                         ))}
                       </div>
                     </div>
                   )}

                   {/* Horarios sugeridos */}
                   <div className="mt-4">
                     <p className="text-sm font-medium text-gray-700 mb-2">Horarios sugeridos:</p>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                       {[
                         { inicio: '08:00', final: '12:00', label: 'Mañana' },
                         { inicio: '13:00', final: '17:00', label: 'Tarde' },
                         { inicio: '09:00', final: '18:00', label: 'Día completo' }
                       ].map((horario, index) => (
                         <button
                           key={index}
                           onClick={() => {
                             setHoraInicio(horario.inicio);
                             setHoraFinal(horario.final);
                           }}
                           className="p-2 text-xs bg-gray-100 hover:bg-[#743fc6]/10 border border-gray-200 hover:border-[#743fc6]/30 rounded-lg transition-all duration-200 text-gray-700 hover:text-[#743fc6]"
                         >
                           <div className="font-medium">{horario.label}</div>
                           <div className="text-gray-500">{horario.inicio} - {horario.final}</div>
                         </button>
                       ))}
                     </div>
                   </div>
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