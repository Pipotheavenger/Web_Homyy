import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { serviceService, categoryService } from '@/lib/services';
import type { Category } from '@/types/database';
import { capitalizeText, capitalizeProperName, capitalizeFirstLetter } from '@/lib/utils';

interface Horario {
  id: string;
  fecha: string;
  horaInicio: string;
  horaFinal: string;
}

interface FormData {
  titulo: string;
  descripcion: string;
  ciudad: string;
  barrio: string;
  categoria: string;
}

export const useCreateService = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    titulo: '',
    descripcion: '',
    ciudad: 'Bogotá',
    barrio: '',
    categoria: ''
  });
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFinal, setHoraFinal] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Cargar categorías al montar el componente
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await categoryService.getAll();
        if (response.success && response.data) {
          setCategories(response.data);
        }
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    };

    loadCategories();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    let processedValue = value;

    // Aplicar capitalización según el campo
    switch (field) {
      case 'titulo':
        processedValue = capitalizeText(value); // Capitalizar todas las palabras
        break;
      case 'descripcion':
        processedValue = capitalizeFirstLetter(value); // Solo primera letra
        break;
      case 'barrio':
        processedValue = capitalizeProperName(value); // Capitalización de nombres propios
        break;
      default:
        processedValue = value;
    }

    setFormData(prev => ({ ...prev, [field]: processedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validar campos requeridos
      if (!formData.titulo || !formData.descripcion || !formData.categoria) {
        setError('Por favor completa todos los campos requeridos');
        setIsLoading(false);
        return;
      }

      if (horarios.length === 0) {
        setError('Debes agregar al menos un horario');
        setIsLoading(false);
        return;
      }

      // Preparar datos del servicio
      const serviceData = {
        title: formData.titulo,
        description: formData.descripcion,
        category_id: formData.categoria,
        location: `Bogotá, ${formData.barrio}`,
        status: 'active',
        schedules: horarios.map(horario => ({
          date: horario.fecha,
          start_time: horario.horaInicio,
          end_time: horario.horaFinal
        }))
      };

      console.log('📤 Enviando datos del servicio:', serviceData);

      // Crear servicio
      const response = await serviceService.create(serviceData);
      
      console.log('📥 Respuesta del servicio:', response);
      
      if (response.success) {
        setSuccess('Servicio creado exitosamente');
        setTimeout(() => {
          router.push('/user/dashboard');
        }, 1500);
      } else {
        console.error('❌ Error en la respuesta:', response.error);
        setError(response.error || 'Error al crear el servicio');
      }
    } catch (err) {
      console.error('💥 Error inesperado:', err);
      setError('Error al crear el servicio. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const agregarHorario = () => {
    if (!fechaSeleccionada || !horaInicio || !horaFinal) {
      alert('Por favor selecciona una fecha y horario completo');
      return;
    }

    // Validar que la fecha no sea pasada
    const todayString = getTodayString();
    if (fechaSeleccionada < todayString) {
      alert('No puedes seleccionar fechas pasadas');
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

  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return {
    formData,
    fechaSeleccionada,
    horaInicio,
    horaFinal,
    focusedField,
    isLoading,
    horarios,
    categories,
    error,
    success,
    setFechaSeleccionada,
    setHoraInicio,
    setHoraFinal,
    setFocusedField,
    handleInputChange,
    handleSubmit,
    agregarHorario,
    eliminarHorario,
    getTodayString
  };
}; 