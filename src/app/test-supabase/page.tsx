'use client';

import { useState } from 'react';
import { testSupabaseConnection, testUserProfilesTable, testWorkerProfilesTable } from '@/lib/test-supabase';
import { useAuth } from '@/hooks/useAuth';

export default function TestSupabasePage() {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, profile, loading, userType } = useAuth();

  const runTests = async () => {
    setIsLoading(true);
    setResults([]);
    
    console.log('🚀 Iniciando pruebas de Supabase...');
    
    // Probar conexión básica
    const connectionTest = await testSupabaseConnection();
    setResults(prev => [...prev, { name: 'Conexión Básica', result: connectionTest }]);
    
    // Probar tabla user_profiles
    const userProfilesTest = await testUserProfilesTable();
    setResults(prev => [...prev, { name: 'Tabla User Profiles', result: userProfilesTest }]);
    
    // Probar tabla worker_profiles
    const workerProfilesTest = await testWorkerProfilesTable();
    setResults(prev => [...prev, { name: 'Tabla Worker Profiles', result: workerProfilesTest }]);
    
    setIsLoading(false);
    console.log('✅ Pruebas completadas');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🧪 Pruebas de Supabase
          </h1>
          
          <p className="text-gray-600 mb-8">
            Esta página te permite probar la conexión con Supabase y verificar que las tablas estén configuradas correctamente.
          </p>
          
          {/* Estado de autenticación actual */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Estado de Autenticación:</h3>
            {loading ? (
              <p className="text-gray-600">Cargando...</p>
            ) : user ? (
              <div className="text-sm space-y-1">
                <p><span className="font-medium">Usuario:</span> {user.email}</p>
                <p><span className="font-medium">Tipo:</span> {userType || 'No determinado'}</p>
                <p><span className="font-medium">Nombre:</span> {profile?.name || 'No disponible'}</p>
                <p><span className="font-medium">ID:</span> {user.id}</p>
              </div>
            ) : (
              <p className="text-gray-600">No hay usuario autenticado</p>
            )}
          </div>
          
          <button
            onClick={runTests}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors mb-8"
          >
            {isLoading ? '🔄 Ejecutando pruebas...' : '🚀 Ejecutar Pruebas'}
          </button>
          
          {results.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Resultados:</h2>
              
              {results.map((test, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{test.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      test.result.success 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {test.result.success ? '✅ Éxito' : '❌ Error'}
                    </span>
                  </div>
                  
                  {test.result.success ? (
                    <p className="text-green-700 text-sm">
                      Prueba completada exitosamente
                    </p>
                  ) : (
                    <div>
                      <p className="text-red-700 text-sm font-medium">Error:</p>
                      <p className="text-red-600 text-sm">{test.result.error}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">📋 Instrucciones:</h3>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Asegúrate de que el archivo .env.local esté creado con las credenciales correctas</li>
              <li>• Verifica que las tablas estén creadas en Supabase</li>
              <li>• Si hay errores, revisa la consola del navegador para más detalles</li>
              <li>• Una vez que las pruebas pasen, puedes eliminar esta página</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
