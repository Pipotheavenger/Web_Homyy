'use client';

import { useState } from 'react';
import { testDatabaseConnection, cleanupTestData, checkDatabaseStructure } from '@/lib/test-database';
import Layout from '@/components/Layout';

export default function TestDatabasePage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleTestConnection = async () => {
    setLoading(true);
    setResults([]);
    setSuccess(false);

    try {
      addResult('Iniciando pruebas de conexión...');
      
      // Verificar estructura
      await checkDatabaseStructure();
      addResult('Verificación de estructura completada');
      
      // Probar conexión
      const success = await testDatabaseConnection();
      
      if (success) {
        setSuccess(true);
        addResult('✅ Todas las pruebas pasaron exitosamente');
      } else {
        addResult('❌ Algunas pruebas fallaron');
      }
      
    } catch (error) {
      addResult(`❌ Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCleanup = async () => {
    setLoading(true);
    try {
      await cleanupTestData();
      addResult('🧹 Limpieza completada');
    } catch (error) {
      addResult(`❌ Error en limpieza: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Test Database">
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Pruebas de Base de Datos</h1>
            
            <div className="space-y-4 mb-6">
              <button
                onClick={handleTestConnection}
                disabled={loading}
                className="bg-[#743fc6] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#6a37b8] transition-colors disabled:opacity-50"
              >
                {loading ? 'Probando...' : 'Ejecutar Pruebas'}
              </button>
              
              <button
                onClick={handleCleanup}
                disabled={loading}
                className="bg-gray-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-600 transition-colors disabled:opacity-50 ml-4"
              >
                Limpiar Datos de Prueba
              </button>
            </div>

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-700 font-medium">Todas las pruebas pasaron exitosamente</span>
                </div>
              </div>
            )}

            {results.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Resultados:</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {results.map((result, index) => (
                    <div key={index} className="text-sm font-mono bg-white p-2 rounded border">
                      {result}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
} 