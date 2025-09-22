// Script para probar la conexión con Supabase
import { supabase } from './supabase';

export const testSupabaseConnection = async () => {
  console.log('🔍 Probando conexión con Supabase...');
  
  try {
    // Probar conexión básica
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error de conexión:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Conexión exitosa con Supabase');
    console.log('📊 Datos de prueba:', data);
    
    return { success: true, data };
    
  } catch (error: any) {
    console.error('❌ Error inesperado:', error);
    return { success: false, error: error.message };
  }
};

export const testUserProfilesTable = async () => {
  console.log('🔍 Probando tabla user_profiles...');
  
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error con user_profiles:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Tabla user_profiles accesible');
    console.log('📊 Estructura:', data);
    
    return { success: true, data };
    
  } catch (error: any) {
    console.error('❌ Error inesperado:', error);
    return { success: false, error: error.message };
  }
};

export const testWorkerProfilesTable = async () => {
  console.log('🔍 Probando tabla worker_profiles...');
  
  try {
    const { data, error } = await supabase
      .from('worker_profiles')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error con worker_profiles:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Tabla worker_profiles accesible');
    console.log('📊 Estructura:', data);
    
    return { success: true, data };
    
  } catch (error: any) {
    console.error('❌ Error inesperado:', error);
    return { success: false, error: error.message };
  }
};
