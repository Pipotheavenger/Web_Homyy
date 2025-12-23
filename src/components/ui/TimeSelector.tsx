import { useState, useRef, useEffect } from 'react';
import { Clock, ChevronDown, X, Plus, Trash2 } from 'lucide-react';

interface Horario {
  id: string;
  fecha: string;
  horaInicio: string;
  horaFinal: string;
}

interface TimeSelectorProps {
  fechaSeleccionada: string;
  horaInicio: string;
  horaFinal: string;
  horarios: Horario[];
  onHoraInicioChange: (hora: string) => void;
  onHoraFinalChange: (hora: string) => void;
  onAgregarHorario: () => void;
  onEliminarHorario: (id: string) => void;
  formatFecha: (fecha: string) => string;
}

export const TimeSelector = ({
  fechaSeleccionada,
  horaInicio,
  horaFinal,
  horarios,
  onHoraInicioChange,
  onHoraFinalChange,
  onAgregarHorario,
  onEliminarHorario,
  formatFecha
}: TimeSelectorProps) => {
  const [showClockInicio, setShowClockInicio] = useState(false);
  const [showClockFinal, setShowClockFinal] = useState(false);
  const clockInicioRef = useRef<HTMLDivElement>(null);
  const clockFinalRef = useRef<HTMLDivElement>(null);

  // Generar horas de 5:00 a 19:00 con intervalos de media hora
  const generarHoras = () => {
    const horas = [];
    for (let hora = 5; hora <= 19; hora++) {
      for (let minuto = 0; minuto < 60; minuto += 30) {
        const horaStr = hora.toString().padStart(2, '0');
        const minutoStr = minuto.toString().padStart(2, '0');
        horas.push(`${horaStr}:${minutoStr}`);
      }
    }
    return horas;
  };

  const horasDisponibles = generarHoras();

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

  const renderTimeSelector = (type: 'inicio' | 'final') => {
    const currentTime = type === 'inicio' ? horaInicio : horaFinal;
    const showSelector = type === 'inicio' ? showClockInicio : showClockFinal;
    
    if (!showSelector) return null;

    const handleTimeSelect = (time: string) => {
      if (type === 'inicio') {
        onHoraInicioChange(time);
        setShowClockInicio(false);
      } else {
        onHoraFinalChange(time);
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
            type="button"
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
                type="button"
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
    <div className="space-y-4">
      {/* Fecha seleccionada info */}
      {fechaSeleccionada && (
        <div className="mb-4 p-3 bg-[#743fc6]/10 border border-[#743fc6]/20 rounded-lg">
          <p className="text-sm font-medium text-[#743fc6] mb-1">
            Fecha seleccionada:
          </p>
          <p className="text-sm text-gray-700">
            {formatFecha(fechaSeleccionada)}
          </p>
        </div>
      )}

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
          onClick={onAgregarHorario}
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
                  type="button"
                  onClick={() => onEliminarHorario(horario.id)}
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
            { inicio: '05:00', final: '12:00', label: 'Mañana' },
            { inicio: '13:00', final: '19:00', label: 'Tarde' },
            { inicio: '08:00', final: '17:00', label: 'Día completo' }
          ].map((horario, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                onHoraInicioChange(horario.inicio);
                onHoraFinalChange(horario.final);
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
  );
}; 