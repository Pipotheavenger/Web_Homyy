import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

interface Postulante {
  id: string;
  nombre: string;
  apellido: string;
  especialidad: string;
  experiencia: number;
  calificacion: number;
  serviciosCompletados: number;
  ubicacion: string;
  disponibilidad: string;
  foto: string;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  fechaPostulacion: string;
  telefono: string;
  email: string;
  precio: number;
}

interface Servicio {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  ubicacion: string;
  fechaPublicacion: string;
  fechaLimite: string;
  estado: 'activo' | 'en_proceso' | 'completado';
  postulantes: number;
  progreso: number;
  etapa: string;
  horariosDisponibilidad: string[];
}

interface Pregunta {
  id: string;
  pregunta: string;
  respuesta: string;
  fecha: string;
  autor: string;
}

export const useDetallesPostulantes = () => {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState('todos');
  const [selectedSort, setSelectedSort] = useState('reciente');
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [candidateToConfirm, setCandidateToConfirm] = useState<Postulante | null>(null);
  const [showCancelServiceModal, setShowCancelServiceModal] = useState(false);

  // Datos de ejemplo del servicio
  const servicio: Servicio = {
    id: '1',
    titulo: 'Limpieza Residencial Completa',
    descripcion: 'Necesito servicios de limpieza profesional para mi casa de 3 habitaciones. Incluye cocina, baños, dormitorios y áreas comunes. Preferiblemente con productos eco-friendly.',
    categoria: 'Limpieza Profesional',
    ubicacion: 'Chapinero, Bogotá',
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
  };

  // Datos de ejemplo de postulantes
  const postulantes: Postulante[] = [
    {
      id: '1',
      nombre: 'María',
      apellido: 'González',
      especialidad: 'Limpieza Profesional',
      experiencia: 5,
      calificacion: 4.8,
      serviciosCompletados: 127,
      ubicacion: 'Chapinero, Bogotá',
      disponibilidad: 'Inmediata',
      foto: '/api/placeholder/200/200',
      estado: 'pendiente',
      fechaPostulacion: 'Hace 2 días',
      telefono: '+57 300 123 4567',
      email: 'maria.gonzalez@email.com',
      precio: 120000
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
      disponibilidad: 'Esta semana',
      foto: '/api/placeholder/200/200',
      estado: 'aprobado',
      fechaPostulacion: 'Hace 1 día',
      telefono: '+57 310 987 6543',
      email: 'carlos.rodriguez@email.com',
      precio: 95000
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
      disponibilidad: 'Inmediata',
      foto: '/api/placeholder/200/200',
      estado: 'pendiente',
      fechaPostulacion: 'Hace 3 días',
      telefono: '+57 315 456 7890',
      email: 'ana.martinez@email.com',
      precio: 140000
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
      disponibilidad: 'Próxima semana',
      foto: '/api/placeholder/200/200',
      estado: 'rechazado',
      fechaPostulacion: 'Hace 4 días',
      telefono: '+57 320 111 2222',
      email: 'luis.sanchez@email.com',
      precio: 110000
    }
  ];

  // Datos de ejemplo de preguntas públicas (versión corta)
  const preguntas: Pregunta[] = [
    {
      id: '1',
      pregunta: '¿Qué productos de limpieza utilizan?',
      respuesta: 'Utilizamos productos eco-friendly certificados, libres de químicos dañinos.',
      fecha: 'Hace 1 día',
      autor: 'María González'
    },
    {
      id: '2',
      pregunta: '¿Incluyen organización de espacios?',
      respuesta: 'Sí, nuestro servicio incluye organización básica de espacios.',
      fecha: 'Hace 2 días',
      autor: 'Carlos Rodríguez'
    },
    {
      id: '3',
      pregunta: '¿Trabajan los fines de semana?',
      respuesta: 'Trabajamos de lunes a sábado. Los domingos no prestamos servicios.',
      fecha: 'Hace 3 días',
      autor: 'Ana Martínez'
    }
  ];

  // Filtrar postulantes
  const filteredPostulantes = useMemo(() => {
    let filtered = postulantes.filter(postulante => {
      if (selectedFilter === 'todos') return true;
      return postulante.estado === selectedFilter;
    });

    // Si hay un candidato seleccionado, mostrar solo ese candidato
    if (selectedCandidate) {
      filtered = filtered.filter(postulante => postulante.id === selectedCandidate);
    }

    // Ordenar postulantes
    switch (selectedSort) {
      case 'reciente':
        filtered.sort((a, b) => {
          const daysA = parseInt(a.fechaPostulacion.match(/\d+/)?.[0] || '0');
          const daysB = parseInt(b.fechaPostulacion.match(/\d+/)?.[0] || '0');
          return daysA - daysB;
        });
        break;
      case 'experiencia':
        filtered.sort((a, b) => b.experiencia - a.experiencia);
        break;
      case 'calificacion':
        filtered.sort((a, b) => b.calificacion - a.calificacion);
        break;
    }

    return filtered;
  }, [selectedFilter, selectedSort, selectedCandidate]);

  const handleVerPerfil = (profesionalId: string) => {
    router.push(`/perfil-profesional?id=${profesionalId}`);
  };

  const handleBack = () => {
    router.back();
  };

  const handleSelectCandidate = (candidateId: string) => {
    const candidate = postulantes.find(p => p.id === candidateId);
    if (candidate) {
      setCandidateToConfirm(candidate);
      setShowConfirmationModal(true);
    }
  };

  const handleConfirmSelection = () => {
    if (candidateToConfirm) {
      setSelectedCandidate(candidateToConfirm.id);
      setShowConfirmationModal(false);
      setCandidateToConfirm(null);
      console.log('Candidato confirmado:', candidateToConfirm.id);
    }
  };

  const handleCloseModal = () => {
    setShowConfirmationModal(false);
    setCandidateToConfirm(null);
  };

  const handleDeselectCandidate = () => {
    setSelectedCandidate(null);
  };

  const handleCancelService = () => {
    setShowCancelServiceModal(true);
  };

  const handleConfirmCancelService = () => {
    setShowCancelServiceModal(false);
    console.log('Servicio cancelado:', servicio.id);
    // Aquí se podría agregar la lógica para cancelar el servicio
  };

  const handleCloseCancelModal = () => {
    setShowCancelServiceModal(false);
  };

  return {
    servicio,
    postulantes: filteredPostulantes,
    preguntas,
    selectedFilter,
    selectedSort,
    selectedCandidate,
    showConfirmationModal,
    candidateToConfirm,
    showCancelServiceModal,
    setSelectedFilter,
    setSelectedSort,
    handleVerPerfil,
    handleBack,
    handleSelectCandidate,
    handleConfirmSelection,
    handleCloseModal,
    handleDeselectCandidate,
    handleCancelService,
    handleConfirmCancelService,
    handleCloseCancelModal
  };
}; 