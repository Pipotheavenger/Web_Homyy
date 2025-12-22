import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { serviceService, categoryService } from '@/lib/services';
import type { Category } from '@/types/database';
import { capitalizeText, capitalizeProperName, capitalizeFirstLetter } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

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
  const [serviceImages, setServiceImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

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
        images: serviceImages.length > 0 ? serviceImages : undefined,
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

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Validar cantidad máxima
    if (serviceImages.length + files.length > 5) {
      setError('Solo puedes subir hasta 5 imágenes');
      return;
    }

    setUploadingImages(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const uploadPromises = Array.from(files).map(async (file) => {
        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
          throw new Error('Solo se permiten archivos de imagen');
        }

        // Validar tamaño (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('Cada imagen debe ser menor a 5MB');
        }

        // Crear un nombre único para el archivo
        const fileExt = file.name.split('.').pop();
        const fileName = `service-images/${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        // Subir imagen a Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('user-uploads')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          throw uploadError;
        }

        // Obtener URL pública de la imagen
        const { data: { publicUrl } } = supabase.storage
          .from('user-uploads')
          .getPublicUrl(fileName);

        return publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setServiceImages(prev => [...prev, ...uploadedUrls]);
    } catch (err: any) {
      console.error('Error subiendo imágenes:', err);
      setError(err.message || 'Error al subir las imágenes');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setServiceImages(prev => prev.filter((_, i) => i !== index));
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
    getTodayString,
    serviceImages,
    uploadingImages,
    handleImageUpload,
    removeImage
  };
}; 