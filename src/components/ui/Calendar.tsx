import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  currentMonth: Date;
  selectedDate: string;
  onDateSelect: (date: string) => void;
  onMonthChange: (direction: 'prev' | 'next') => void;
  getTodayString: () => string;
}

export const Calendar = ({ 
  currentMonth, 
  selectedDate, 
  onDateSelect, 
  onMonthChange,
  getTodayString 
}: CalendarProps) => {
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
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
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const currentDateString = `${year}-${month}-${dayStr}`;
      const isSelected = selectedDate === currentDateString;
      
      // Verificar si la fecha es pasada
      const todayString = getTodayString();
      const isPastDate = currentDateString < todayString;
      
      // Para el día actual, verificar si ya pasó la hora actual
      const isToday = currentDateString === todayString;
      const currentHour = new Date().getHours();
      const currentMinute = new Date().getMinutes();
      const currentTimeString = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
      const isTodayPastTime = isToday && currentTimeString >= '19:00';
      
      days.push(
        <button
          key={day}
          onClick={() => {
            if (!isPastDate && !isTodayPastTime) {
              onDateSelect(currentDateString);
            }
          }}
          disabled={isPastDate || isTodayPastTime}
          className={`w-8 h-8 rounded-full text-sm font-medium transition-all duration-200 ${
            isSelected 
              ? 'bg-[#743fc6] text-white' 
              : isPastDate || isTodayPastTime
              ? 'text-gray-300 cursor-not-allowed'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="space-y-4">
      {/* Información sobre fechas bloqueadas */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-700">
          <span className="font-medium">Nota:</span> Las fechas pasadas están bloqueadas. Solo puedes seleccionar fechas futuras.
        </p>
      </div>
      
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onMonthChange('prev')}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <h4 className="text-lg font-semibold text-gray-800 capitalize">
          {formatMonth(currentMonth)}
        </h4>
        <button
          onClick={() => onMonthChange('next')}
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
    </div>
  );
}; 