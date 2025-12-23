'use client';
import { useState } from 'react';
import { AlertCircle, Camera, X } from 'lucide-react';
import Layout from '@/components/Layout';
import { useCreateService } from '@/hooks/useCreateService';
import { Calendar } from '@/components/ui/Calendar';
import { TimeSelector } from '@/components/ui/TimeSelector';
import { FormInput } from '@/components/ui/FormInput';

export default function CrearServicioPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const {
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
    serviceImages,
    uploadingImages,
    setFechaSeleccionada,
    setHoraInicio,
    setHoraFinal,
    setFocusedField,
    handleInputChange,
    handleSubmit,
    agregarHorario,
    eliminarHorario,
    getTodayString,
    handleImageUpload,
    removeImage
  } = useCreateService();

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const formatFecha = (fecha: string) => {
    const [year, month, day] = fecha.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const tituloIcon = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  );

  const descripcionIcon = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );

  const categoriaIcon = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  );

  const barrioIcon = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );

  return (
    <Layout title="Crear Servicio">
      <div className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Form - Left Column */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Detalles del Servicio</h2>
                
                {/* Mensajes de error y éxito */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                    <div className="flex items-center space-x-2">
                      <AlertCircle size={20} className="text-red-500" />
                      <span className="text-red-700 font-medium">{error}</span>
                    </div>
                  </div>
                )}
                
                {success && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-green-700 font-medium">{success}</span>
                    </div>
                  </div>
                )}
                
                <div className="space-y-6">
                  {/* Título del Servicio */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Título del Servicio
                    </label>
                    <div className="relative">
                      <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-all duration-300 ${focusedField === 'titulo' ? 'text-[#743fc6] scale-110' : 'text-gray-400'}`}>
                        {tituloIcon}
                      </div>
                      <input
                        type="text"
                        placeholder="Ej: Limpieza general de casa"
                        value={formData.titulo}
                        onChange={(e) => handleInputChange('titulo', e.target.value)}
                        onFocus={() => setFocusedField('titulo')}
                        onBlur={() => setFocusedField(null)}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all duration-300 bg-white text-gray-900 placeholder-gray-400 font-medium ${focusedField === 'titulo' ? 'border-[#743fc6] focus:ring-[#743fc6]/20' : 'border-gray-200 hover:border-gray-300'} focus:ring-4 focus:outline-none`}
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
                        {descripcionIcon}
                      </div>
                      <textarea
                        placeholder="Describe detalladamente el servicio que necesitas..."
                        value={formData.descripcion}
                        onChange={(e) => handleInputChange('descripcion', e.target.value)}
                        onFocus={() => setFocusedField('descripcion')}
                        onBlur={() => setFocusedField(null)}
                        rows={4}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all duration-300 bg-white text-gray-900 placeholder-gray-400 font-medium resize-none ${focusedField === 'descripcion' ? 'border-[#743fc6] focus:ring-[#743fc6]/20' : 'border-gray-200 hover:border-gray-300'} focus:ring-4 focus:outline-none`}
                      />
                    </div>
                  </div>

                  {/* Imágenes del Servicio (Opcional) */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Fotos del Servicio <span className="text-gray-500 font-normal">(Opcional - Máximo 5)</span>
                    </label>
                    
                    {/* Preview de imágenes */}
                    {serviceImages.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-3">
                        {serviceImages.map((url, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={url}
                              alt={`Imagen ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Botón para subir imágenes */}
                    {serviceImages.length < 5 && (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          {uploadingImages ? (
                            <>
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-2"></div>
                              <p className="text-sm text-gray-600">Subiendo imágenes...</p>
                            </>
                          ) : (
                            <>
                              <Camera className="w-8 h-8 text-gray-400 mb-2" />
                              <p className="text-sm text-gray-600">
                                <span className="font-semibold text-purple-600">Haz clic para subir</span> o arrastra imágenes aquí
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {serviceImages.length}/5 imágenes • Máximo 5MB por imagen
                              </p>
                            </>
                          )}
                        </div>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e.target.files)}
                          disabled={uploadingImages || serviceImages.length >= 5}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* Categoría */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Categoría
                    </label>
                    <div className="relative">
                      <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-all duration-300 ${focusedField === 'categoria' ? 'text-[#743fc6] scale-110' : 'text-gray-400'}`}>
                        {categoriaIcon}
                      </div>
                      <select
                        value={formData.categoria}
                        onChange={(e) => handleInputChange('categoria', e.target.value)}
                        onFocus={() => setFocusedField('categoria')}
                        onBlur={() => setFocusedField(null)}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all duration-300 bg-white text-gray-900 font-medium ${focusedField === 'categoria' ? 'border-[#743fc6] focus:ring-[#743fc6]/20' : 'border-gray-200 hover:border-gray-300'} focus:ring-4 focus:outline-none`}
                      >
                        <option value="">Seleccionar categoría</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
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
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          value="Bogotá"
                          readOnly
                          className="w-full pl-10 pr-4 py-3 rounded-xl border-2 bg-gray-50 text-gray-600 font-medium border-gray-200 cursor-not-allowed"
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
                          {barrioIcon}
                        </div>
                        <input
                          type="text"
                          placeholder="Chapinero"
                          value={formData.barrio}
                          onChange={(e) => handleInputChange('barrio', e.target.value)}
                          onFocus={() => setFocusedField('barrio')}
                          onBlur={() => setFocusedField(null)}
                          className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all duration-300 bg-white text-gray-900 placeholder-gray-400 font-medium ${focusedField === 'barrio' ? 'border-[#743fc6] focus:ring-[#743fc6]/20' : 'border-gray-200 hover:border-gray-300'} focus:ring-4 focus:outline-none`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Botón Crear Servicio (Desktop) */}
                  <div className="pt-4 hidden lg:block">
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
                </div>
              </div>
            </div>

            {/* Right Sidebar - Calendar */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Disponibilidad</h3>
                
                <Calendar
                  currentMonth={currentMonth}
                  selectedDate={fechaSeleccionada}
                  onDateSelect={setFechaSeleccionada}
                  onMonthChange={(direction) => direction === 'next' ? nextMonth() : prevMonth()}
                  getTodayString={getTodayString}
                />

                {/* Selected Date Display */}
                {fechaSeleccionada && (
                  <div className="mt-4 p-3 bg-[#743fc6]/10 border border-[#743fc6]/20 rounded-lg">
                    <p className="text-sm font-medium text-[#743fc6]">
                      Fecha seleccionada:
                    </p>
                    <p className="text-sm text-gray-700">
                      {formatFecha(fechaSeleccionada)}
                    </p>
                  </div>
                )}
              </div>

              {/* Horario Section */}
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-[#7d4ccb] rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-[#7d4ccb]">Horario de Disponibilidad</h3>
                </div>
                
                <TimeSelector
                  fechaSeleccionada={fechaSeleccionada}
                  horaInicio={horaInicio}
                  horaFinal={horaFinal}
                  horarios={horarios}
                  onHoraInicioChange={setHoraInicio}
                  onHoraFinalChange={setHoraFinal}
                  onAgregarHorario={agregarHorario}
                  onEliminarHorario={eliminarHorario}
                  formatFecha={formatFecha}
                />
              </div>

              {/* Botón Crear Servicio (Mobile) */}
              <div className="pt-2 block lg:hidden">
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
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
} 