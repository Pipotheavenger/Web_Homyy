'use client';

export const dynamic = 'force-dynamic';

import { useRouter, useSearchParams } from 'next/navigation';
import { 
  MapPin,
  Calendar,
  Shield,
  Star,
  CheckCircle,
  Award,
  DollarSign,
  Clock,
  Briefcase,
  ImageIcon,
  Users
} from 'lucide-react';
import Layout from '@/components/Layout';
import { useWorkerProfile } from '@/hooks/useWorkerProfile';
import { Suspense, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

function PerfilProfesionalPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workerId = searchParams.get('id');
  const [activeTab, setActiveTab] = useState('informacion');
  const [portfolioImages, setPortfolioImages] = useState<string[]>([]);
  const [loadingPortfolio, setLoadingPortfolio] = useState(false);

  const {
    worker,
    workerProfile,
    reviews,
    reviewStats,
    loading,
    error,
    formatDate,
    getTimeAgo,
    getStarClass
  } = useWorkerProfile(workerId || '');

  // Cargar imágenes del portfolio cuando se carga el perfil
  useEffect(() => {
    const loadPortfolioImages = async () => {
      if (!worker?.user_id) return;
      
      setLoadingPortfolio(true);
      try {
        // Intentar cargar imágenes del bucket worker-portfolio
        const { data: files, error: listError } = await supabase.storage
          .from('worker-portfolio')
          .list(worker.user_id, {
            limit: 100,
            offset: 0,
          });

        if (listError) {
          console.log('No se encontraron imágenes en el portfolio:', listError);
          setPortfolioImages([]);
          return;
        }

        if (files && files.length > 0) {
          // Obtener URLs públicas de las imágenes
          const imageUrls = files
            .filter(file => file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i))
            .map(file => {
              const { data: { publicUrl } } = supabase.storage
                .from('worker-portfolio')
                .getPublicUrl(`${worker.user_id}/${file.name}`);
              return publicUrl;
            });
          
          setPortfolioImages(imageUrls);
        }
      } catch (err) {
        console.error('Error cargando portfolio:', err);
        setPortfolioImages([]);
      } finally {
        setLoadingPortfolio(false);
      }
    };

    if (worker?.user_id && activeTab === 'reseñas') {
      loadPortfolioImages();
    }
  }, [worker?.user_id, activeTab]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={getStarClass(i, rating)}
        size={16}
      />
    ));
  };

  const handleBack = () => {
    // Usar router.back() que navega al historial anterior
    // Si no hay historial previo, Next.js manejará la navegación adecuadamente
    // Como fallback adicional, verificamos si hay una página referrer
    if (typeof window !== 'undefined') {
      // Intentar ir atrás en el historial del navegador
      const hasHistory = window.history.length > 1 || document.referrer !== '';
      
      if (hasHistory) {
        router.back();
      } else {
        // Si no hay historial, redirigir al dashboard del usuario
        router.push('/user/dashboard');
      }
    } else {
      // Fallback en caso de SSR
      router.push('/user/dashboard');
    }
  };

  // Skeleton mientras carga
  const ProfileSkeleton = () => (
      <div className="p-4 md:p-6 space-y-6 animate-pulse">
        <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-10">
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <div className="w-32 h-32 bg-white/20 rounded-2xl"></div>
          <div className="flex-1 space-y-3">
            <div className="h-8 bg-white/20 rounded w-48"></div>
            <div className="h-6 bg-white/20 rounded w-32"></div>
            <div className="h-4 bg-white/20 rounded w-64"></div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-xl p-4">
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <Layout title="Perfil Profesional" showBackButton={true} onBackClick={handleBack} currentPage="perfil-profesional">
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          <ProfileSkeleton />
        </div>
      </Layout>
    );
  }

  if (error || !worker) {
    return (
      <Layout title="Perfil Profesional" showBackButton={true} onBackClick={handleBack} currentPage="perfil-profesional">
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error al cargar el perfil</h3>
            <p className="text-red-600 mb-4">{error || 'Usuario no encontrado'}</p>
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Volver
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Perfil Profesional" showBackButton={true} onBackClick={handleBack} currentPage="perfil-profesional">
      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header Hero Section */}
        <div className="relative bg-gradient-to-br from-purple-600 via-[#743fc6] to-pink-600 rounded-3xl shadow-xl overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative p-6 md:p-10">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-28 h-28 md:w-32 md:h-32 bg-white rounded-2xl flex items-center justify-center shadow-2xl ring-4 ring-white/50">
                  {worker?.profile_picture_url ? (
                    <img
                      src={worker.profile_picture_url}
                      alt={worker.name}
                      className="w-full h-full rounded-2xl object-cover"
                    />
                  ) : (
                    <span className="text-3xl md:text-4xl font-bold text-purple-600">
                      {worker?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                    </span>
                  )}
                </div>
                {workerProfile?.is_verified && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full p-1 shadow-lg">
                    <CheckCircle className="text-white" size={20} />
                  </div>
                )}
              </div>

              {/* Información Principal */}
              <div className="flex-1 text-center lg:text-left text-white">
                <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold">{worker?.name || 'Usuario'}</h1>
                </div>
                <p className="text-xl md:text-2xl text-purple-50 mb-4">{workerProfile?.profession || 'Profesional'}</p>
                
                {/* Rating y Stats */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 md:gap-6">
                  {reviewStats.totalReviews > 0 && (
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                      <div className="flex items-center">{renderStars(reviewStats.averageRating)}</div>
                      <span className="font-semibold">{reviewStats.averageRating.toFixed(1)}</span>
                      <span className="text-sm">({reviewStats.totalReviews})</span>
                    </div>
                  )}
                  
                  {workerProfile?.experience_years && (
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                      <Award size={18} />
                      <span>{workerProfile.experience_years} años</span>
                    </div>
                  )}
                  
                  {workerProfile?.location && (
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                      <MapPin size={18} />
                      <span>{workerProfile.location}</span>
                    </div>
                  )}

                  {workerProfile?.is_available !== false && (
                    <div className="flex items-center gap-2 bg-green-500/80 backdrop-blur-sm px-4 py-2 rounded-full">
                      <CheckCircle size={18} />
                      <span>Disponible</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Métricas Rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-600">Servicios</p>
                <p className="text-2xl font-bold text-gray-900">{workerProfile?.total_services || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Clock className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-600">Experiencia</p>
                <p className="text-2xl font-bold text-gray-900">{workerProfile?.experience_years || 0} años</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Star className="text-yellow-600" size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-600">Calificación</p>
                <p className="text-2xl font-bold text-gray-900">{reviewStats.averageRating > 0 ? reviewStats.averageRating.toFixed(1) : '0.0'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-600">Reseñas</p>
                <p className="text-2xl font-bold text-gray-900">{reviewStats.totalReviews}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs de Navegación */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100">
            <div className="flex flex-wrap gap-2 p-4">
              {[
                { id: 'informacion', label: 'Información', icon: Users },
                { id: 'profesional', label: 'Profesional', icon: Briefcase },
                { id: 'reseñas', label: 'Reseñas', icon: Star }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all font-medium ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon size={18} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Tab: Información Personal */}
            {activeTab === 'informacion' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Información Personal */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Users className="text-purple-600" size={24} />
                      Información Personal
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="p-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl border border-gray-100">
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Nombre Completo</label>
                        <p className="text-lg font-semibold text-gray-900">{worker?.name || 'No disponible'}</p>
                      </div>

                      {workerProfile?.location && (
                        <div className="p-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl border border-gray-100">
                          <label className="text-xs font-semibold text-gray-500 uppercase mb-1 flex items-center gap-2">
                            <MapPin size={14} />
                            Ubicación
                          </label>
                          <p className="text-base text-gray-900">{workerProfile.location}</p>
                        </div>
                      )}

                      <div className="p-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl border border-gray-100">
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 flex items-center gap-2">
                          <Calendar size={14} />
                          Miembro desde
                        </label>
                        <p className="text-base text-gray-900">
                          {worker?.created_at ? formatDate(worker.created_at) : 'Fecha no disponible'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Estado y Verificación */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Shield className="text-purple-600" size={24} />
                      Estado de Cuenta
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Verificación</label>
                            <div className="flex items-center gap-2">
                              {workerProfile?.is_verified ? (
                                <>
                                  <CheckCircle className="text-purple-600" size={20} />
                                  <span className="font-semibold text-gray-900">Cuenta Verificada</span>
                                </>
                              ) : (
                                <span className="font-semibold text-gray-600">No verificada</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {reviewStats.totalReviews > 0 && (
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                          <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Nivel de Satisfacción</label>
                          <div className="flex items-center gap-3">
                            <div className="text-3xl font-bold text-blue-600">{Math.round((reviews.filter((r: any) => Number(r.rating) >= 4).length / reviews.length) * 100)}%</div>
                            <div className="flex-1">
                              <div className="w-full bg-blue-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all"
                                  style={{ width: `${Math.round((reviews.filter((r: any) => Number(r.rating) >= 4).length / reviews.length) * 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {workerProfile?.total_services !== undefined && (
                        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                          <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Servicios Totales</label>
                          <p className="text-3xl font-bold text-purple-600">{workerProfile.total_services || 0}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Información Profesional */}
            {activeTab === 'profesional' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Información Profesional */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Briefcase className="text-purple-600" size={24} />
                      Información Profesional
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Profesión</label>
                        <p className="text-lg font-semibold text-gray-900">{workerProfile?.profession || 'No especificado'}</p>
                      </div>

                      {workerProfile?.experience_years && (
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                          <label className="text-xs font-semibold text-gray-500 uppercase mb-1 flex items-center gap-2">
                            <Award size={14} />
                            Años de Experiencia
                          </label>
                          <p className="text-2xl font-bold text-blue-600">{workerProfile.experience_years} años</p>
                        </div>
                      )}

                      {workerProfile?.hourly_rate && (
                        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                          <label className="text-xs font-semibold text-gray-500 uppercase mb-1 flex items-center gap-2">
                            <DollarSign size={14} />
                            Tarifa por Hora
                          </label>
                          <p className="text-2xl font-bold text-purple-600">
                            {new Intl.NumberFormat('es-CO', {
                              style: 'currency',
                              currency: 'COP',
                              minimumFractionDigits: 0
                            }).format(Number(workerProfile.hourly_rate))}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bio y Categorías */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Users className="text-purple-600" size={24} />
                      Descripción y Especialidades
                    </h3>
                    
                    {(workerProfile?.bio || workerProfile?.profile_description) && (
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Biografía Profesional</label>
                        <p className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {workerProfile.bio || workerProfile.profile_description}
                        </p>
                      </div>
                    )}

                    {/* Categorías */}
                    {workerProfile?.categories && workerProfile.categories.length > 0 && (
                      <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200">
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-3 block">Categorías de Servicio</label>
                        <div className="flex flex-wrap gap-2">
                          {workerProfile.categories.map((category: string, index: number) => (
                            <span
                              key={index}
                              className="px-3 py-1.5 bg-white rounded-full text-sm font-medium text-orange-700 border border-orange-200"
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Certificaciones */}
                    {workerProfile?.certifications && workerProfile.certifications.length > 0 && (
                      <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-200">
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-3 block flex items-center gap-2">
                          <Award size={14} />
                          Certificaciones
                        </label>
                        <div className="space-y-2">
                          {workerProfile.certifications.map((cert: string, index: number) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                              <CheckCircle className="text-indigo-600" size={16} />
                              <span>{cert}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Reseñas */}
            {activeTab === 'reseñas' && (
              <div className="space-y-6">
                {/* Sección de Portfolio/Trabajos Anteriores */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <ImageIcon className="text-purple-600" size={24} />
                      Trabajos Anteriores
                    </h3>
                  
                  {loadingPortfolio ? (
                    <div className="bg-gray-50 rounded-xl border border-gray-200 p-12 text-center">
                      <div className="w-8 h-8 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-600">Cargando portfolio...</p>
                    </div>
                  ) : portfolioImages.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {portfolioImages.map((imageUrl, index) => (
                        <div key={index} className="relative group aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                          <Image
                            src={imageUrl}
                            alt={`Trabajo anterior ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
                      <ImageIcon className="mx-auto text-gray-400 mb-4" size={48} />
                      <p className="text-gray-600 mb-2 font-medium">Sin imágenes de trabajos anteriores</p>
                      <p className="text-sm text-gray-500">
                        Este profesional aún no ha compartido imágenes de sus trabajos
                      </p>
                    </div>
                  )}
                </div>

                {/* Resumen de Reseñas */}
                {reviewStats.totalReviews > 0 && (
                  <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                    <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 text-lg">Resumen de Calificaciones</h4>
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center">{renderStars(reviewStats.averageRating)}</div>
                          <span className="text-3xl font-bold text-gray-900">
                            {reviewStats.averageRating.toFixed(1)}
                          </span>
                          <span className="text-gray-600">({reviewStats.totalReviews} reseñas)</span>
                        </div>
                      </div>
                      <div className="text-center md:text-right">
                        <div className="text-4xl font-bold text-purple-600">
                          {Math.round((reviews.filter((r: any) => Number(r.rating) >= 4).length / reviews.length) * 100)}%
                        </div>
                        <div className="text-sm text-gray-600">Satisfacción</div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Lista de Reseñas */}
                <div className="space-y-4">
                  {reviews.length > 0 ? (
                    reviews.map((review: any) => (
                      <div key={review.id} className="p-5 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                            {review.reviewer?.profile_picture_url ? (
                              <img 
                                src={review.reviewer.profile_picture_url} 
                                alt={review.reviewer.name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-white font-bold text-sm">
                                {review.reviewer?.name?.substring(0, 2).toUpperCase() || 'CL'}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                              <div>
                                <h4 className="font-semibold text-gray-900">{review.reviewer?.name || 'Cliente'}</h4>
                                {review.service?.title && (
                                  <p className="text-sm text-gray-600">{review.service.title}</p>
                                )}
                              </div>
                              <span className="text-sm text-gray-500">{getTimeAgo(review.created_at)}</span>
                            </div>
                            <div className="flex items-center gap-1 mb-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star} 
                                  size={16} 
                                  className={star <= Number(review.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} 
                                />
                              ))}
                            </div>
                            {review.comment && (
                              <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                      <Star className="mx-auto text-gray-400 mb-4" size={48} />
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Aún no tiene reseñas</h4>
                      <p className="text-gray-600">Este profesional aún no ha recibido calificaciones</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default function PerfilProfesionalPage() {
  return (
    <Suspense fallback={
      <Layout title="Perfil Profesional" currentPage="perfil-profesional">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Cargando perfil profesional...</h1>
            <div className="w-8 h-8 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      </Layout>
    }>
      <PerfilProfesionalPageContent />
    </Suspense>
  );
}
