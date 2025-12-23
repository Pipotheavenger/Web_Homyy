'use client';

import { useState, useEffect } from 'react';
import { termsService } from '@/lib/api/terms';

export default function TerminosYCondicionesPage() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<string>('');

  useEffect(() => {
    loadTerms();
  }, []);

  const loadTerms = async () => {
    try {
      const response = await termsService.getTerms();
      
      if (response.success && response.data) {
        setContent(response.data.content);
        setUpdatedAt(response.data.updated_at);
      } else {
        setContent('<h2>Términos y Condiciones</h2><p>Contenido no disponible en este momento.</p>');
      }
    } catch (error) {
      console.error('Error al cargar términos:', error);
      setContent('<h2>Error</h2><p>No se pudo cargar el contenido.</p>');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return new Date().toLocaleDateString('es-CO');
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Términos y Condiciones
          </h1>
          <p className="text-gray-600">
            Última actualización: {formatDate(updatedAt)}
          </p>
        </div>

        {/* Contenedor principal para el contenido */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div 
              className="prose prose-lg max-w-none text-gray-700 space-y-6"
              dangerouslySetInnerHTML={{ __html: content }}
              style={{
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
              }}
            />
          )}
        </div>

        {/* Botón para volver */}
        <div className="text-center mt-8">
          <button
            onClick={() => window.close()}
            className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all duration-200 shadow-lg"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

