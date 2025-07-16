import { createClient } from '@supabase/supabase-js';
import { serviceService, categoryService, statsService } from './services';

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function testDatabaseConnection() {
  console.log('🔍 Probando conexión con la base de datos...');
  
  try {
    // 1. Probar conexión básica
    console.log('1. Probando conexión básica...');
    const { data: testData, error: testError } = await supabase
      .from('categories')
      .select('*')
      .limit(1);
    
    if (testError) {
      console.error('❌ Error de conexión:', testError);
      return false;
    }
    
    console.log('✅ Conexión básica exitosa');
    
    // 2. Probar obtener categorías
    console.log('2. Probando obtener categorías...');
    const categoriesResponse = await categoryService.getAll();
    
    if (categoriesResponse.success) {
      console.log(`✅ Categorías obtenidas: ${categoriesResponse.data?.length || 0}`);
      console.log('Categorías:', categoriesResponse.data);
    } else {
      console.error('❌ Error obteniendo categorías:', categoriesResponse.error);
    }
    
    // 3. Probar crear un servicio de prueba
    console.log('3. Probando crear servicio...');
    const testService = {
      title: 'Servicio de prueba',
      description: 'Este es un servicio de prueba para verificar la funcionalidad',
      category_id: categoriesResponse.data?.[0]?.id || '1',
      location: 'Bogotá, Chapinero',
      status: 'active',
      schedules: [
        {
          date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Mañana
          start_time: '09:00',
          end_time: '17:00'
        },
        {
          date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // En 3 días
          start_time: '14:00',
          end_time: '18:00'
        }
      ]
    };
    
    const createResponse = await serviceService.create(testService);
    
    if (createResponse.success) {
      console.log('✅ Servicio creado exitosamente');
      console.log('ID del servicio:', createResponse.data?.id);
      
      // 4. Probar obtener servicios del usuario
      console.log('4. Probando obtener servicios del usuario...');
      const servicesResponse = await serviceService.getUserServices();
      
      if (servicesResponse.success) {
        console.log(`✅ Servicios obtenidos: ${servicesResponse.data?.length || 0}`);
        console.log('Servicios:', servicesResponse.data);
      } else {
        console.error('❌ Error obteniendo servicios:', servicesResponse.error);
      }
      
      // 5. Probar estadísticas
      console.log('5. Probando obtener estadísticas...');
      const statsResponse = await statsService.getDashboardStats();
      
      if (statsResponse.success) {
        console.log('✅ Estadísticas obtenidas');
        console.log('Estadísticas:', statsResponse.data);
      } else {
        console.error('❌ Error obteniendo estadísticas:', statsResponse.error);
      }
      
    } else {
      console.error('❌ Error creando servicio:', createResponse.error);
    }
    
    console.log('🎉 Pruebas completadas');
    return true;
    
  } catch (error) {
    console.error('❌ Error general:', error);
    return false;
  }
}

// Función para limpiar datos de prueba
export async function cleanupTestData() {
  console.log('🧹 Limpiando datos de prueba...');
  
  try {
    // Eliminar servicios de prueba
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('title', 'Servicio de prueba');
    
    if (error) {
      console.error('Error limpiando servicios:', error);
    } else {
      console.log('✅ Datos de prueba limpiados');
    }
  } catch (error) {
    console.error('Error en limpieza:', error);
  }
}

// Función para verificar la estructura de la base de datos
export async function checkDatabaseStructure() {
  console.log('🔍 Verificando estructura de la base de datos...');
  
  try {
    // Verificar tablas
    const tables = ['categories', 'services', 'schedules', 'professionals', 'reviews', 'transactions'];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.error(`❌ Error accediendo a tabla ${table}:`, error);
      } else {
        console.log(`✅ Tabla ${table} accesible`);
      }
    }
    
    console.log('🎉 Verificación de estructura completada');
    
  } catch (error) {
    console.error('❌ Error verificando estructura:', error);
  }
} 