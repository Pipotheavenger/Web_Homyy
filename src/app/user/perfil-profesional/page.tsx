'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { MapPin, Star, Users, MessageCircle, Calendar } from 'lucide-react';
import Layout from '@/components/Layout';
import { useWorkerProfile } from '@/hooks/useWorkerProfile';

export default function PerfilProfesionalPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workerId = searchParams.get('id');

  console.log('🔗 URL params - Worker ID:', workerId);
  console.log('🔗 Search params completos:', Object.fromEntries(searchParams.entries()));

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
    router.back();
  };

  if (loading) {
    return (
      <Layout title="Perfil Profesional" showBackButton={true} onBackClick={handleBack}>
        <div className="p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando perfil...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !worker) {
    return (
      <Layout title="Perfil Profesional" showBackButton={true} onBackClick={handleBack}>
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
    <Layout title="Perfil Profesional" showBackButton={true} onBackClick={handleBack}>
      <div className="p-6 max-w-5xl mx-auto">
        {/* Header del Perfil */}
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl p-8 mb-6 text-white shadow-lg">
          <div className="flex items-center space-x-6">
            {/* Foto de perfil */}
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center border-4 border-white/30 shadow-xl">
              {workerProfile?.profile_picture_url ? (
                <img
                  src={workerProfile.profile_picture_url}
                  alt={worker.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <span className="text-4xl font-bold text-purple-600">
                  {worker.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                </span>
              )}
            </div>

            {/* Información básica */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{worker.name}</h1>
              <p className="text-lg opacity-90 mb-3">
                {workerProfile?.profession || 'Profesional'}
              </p>

              {/* Estadísticas rápidas */}
              <div className="flex items-center space-x-6">
                {workerProfile?.experience_years && (
                  <div className="flex items-center space-x-2">
                    <Calendar size={18} />
                    <span>{workerProfile.experience_years} años de experiencia</span>
                  </div>
                )}
                
                {reviewStats.totalReviews > 0 && (
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      {renderStars(reviewStats.averageRating)}
                    </div>
                    <span className="font-semibold">
                      {reviewStats.averageRating.toFixed(1)} ({reviewStats.totalReviews})
                    </span>
                  </div>
                )}

                {workerProfile?.total_services && (
                  <div className="flex items-center space-x-2">
                    <Users size={18} />
                    <span>{workerProfile.total_services} servicios</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Información Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sobre el profesional */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Sobre el Profesional</h2>
              
              {workerProfile?.bio ? (
                <p className="text-gray-700 leading-relaxed mb-4">{workerProfile.bio}</p>
              ) : (
                <p className="text-gray-500 italic">Este profesional aún no ha agregado una biografía.</p>
              )}

              {workerProfile?.location && (
                <div className="flex items-center space-x-2 text-gray-600 mt-4">
                  <MapPin size={16} />
                  <span>{workerProfile.location}</span>
                </div>
              )}

              {workerProfile?.certifications && workerProfile.certifications.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Certificaciones</h3>
                  <ul className="space-y-1">
                    {workerProfile.certifications.map((cert: string, index: number) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center space-x-2">
                        <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                        <span>{cert}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {workerProfile?.service_areas && workerProfile.service_areas.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Áreas de Servicio</h3>
                  <div className="flex flex-wrap gap-2">
                    {workerProfile.service_areas.map((area: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Reseñas */}
            {reviewStats.totalReviews > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Reseñas ({reviewStats.totalReviews})
                </h2>

                {/* Resumen de calificaciones */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-6">
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-800">
                        {reviewStats.averageRating.toFixed(1)}
                      </div>
                      <div className="flex items-center justify-center my-2">
                        {renderStars(reviewStats.averageRating)}
                      </div>
                      <div className="text-sm text-gray-600">{reviewStats.totalReviews} reseñas</div>
                    </div>

                    <div className="flex-1">
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <div key={rating} className="flex items-center space-x-2 mb-1">
                          <span className="text-sm w-2">{rating}</span>
                          <Star size={12} className="text-yellow-400 fill-current" />
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-yellow-400 h-2 rounded-full"
                              style={{
                                width: `${
                                  reviewStats.totalReviews > 0
                                    ? (reviewStats.ratingDistribution[rating] / reviewStats.totalReviews) * 100
                                    : 0
                                }%`
                              }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-8">
                            {reviewStats.ratingDistribution[rating]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Lista de reseñas */}
                <div className="space-y-4">
                  {reviews.slice(0, 5).map((review: any) => (
                    <div key={review.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-800">
                            {review.client?.name || 'Cliente'}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {review.service?.title || 'Servicio'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1">
                          {renderStars(Number(review.rating))}
                        </div>
                      </div>
                      <p className="text-gray-700 mb-2">{review.comment}</p>
                      <p className="text-xs text-gray-500">{getTimeAgo(review.created_at)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {reviewStats.totalReviews === 0 && (
              <div className="bg-white rounded-2xl shadow-sm border p-8 text-center">
                <MessageCircle size={48} className="text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Sin reseñas aún</h3>
                <p className="text-gray-600">
                  Este profesional aún no tiene reseñas. ¡Sé el primero en contratarlo!
                </p>
              </div>
            )}
          </div>

          {/* Sidebar - Información de Contacto */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Información</h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users size={16} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Estado</p>
                    <p className="text-xs text-green-600">
                      {workerProfile?.is_available !== false ? 'Disponible' : 'No disponible'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Miembro desde</p>
                    <p className="text-xs text-gray-600">{formatDate(worker.created_at)}</p>
                  </div>
                </div>

                {worker.phone && (
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600">📱</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">Teléfono</p>
                      <p className="text-xs text-gray-600">{worker.phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {workerProfile && (
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Estadísticas</h2>
                <div className="space-y-3">
                  {workerProfile.total_services && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Servicios completados</span>
                      <span className="font-semibold text-gray-800">{workerProfile.total_services}</span>
                    </div>
                  )}
                  {workerProfile.experience_years && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Años de experiencia</span>
                      <span className="font-semibold text-gray-800">{workerProfile.experience_years}</span>
                    </div>
                  )}
                  {reviewStats.totalReviews > 0 && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Calificación promedio</span>
                        <span className="font-semibold text-gray-800">
                          {reviewStats.averageRating.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total de reseñas</span>
                        <span className="font-semibold text-gray-800">{reviewStats.totalReviews}</span>
                      </div>
                    </>
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
