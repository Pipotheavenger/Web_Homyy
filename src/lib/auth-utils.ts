import { supabase } from './supabase';

export interface UserProfile {
  user_type: 'user' | 'worker';
  name: string;
  email: string;
}

/**
 * Obtiene el tipo de usuario (user o worker) desde la base de datos
 */
export const getUserType = async (userId: string): Promise<'user' | 'worker' | null> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('user_type')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error obteniendo tipo de usuario:', error);
      return null;
    }

    return data?.user_type || null;
  } catch (error) {
    console.error('Error inesperado obteniendo tipo de usuario:', error);
    return null;
  }
};

/**
 * Obtiene el perfil completo del usuario
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('user_type, name, email')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error obteniendo perfil de usuario:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        userId,
      });
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error inesperado obteniendo perfil de usuario:',
      error instanceof Error ? error.message : String(error),
      { userId }
    );
    return null;
  }
};

/**
 * Redirige al usuario al dashboard correspondiente según su tipo
 */
export const redirectToUserDashboard = (userType: 'user' | 'worker'): string => {
  switch (userType) {
    case 'user':
      return '/user/dashboard';
    case 'worker':
      return '/worker/dashboard';
    default:
      return '/user/dashboard'; // Default fallback
  }
};

/**
 * Verifica si el usuario actual está autenticado y obtiene su tipo
 */
export const getCurrentUserType = async (): Promise<'user' | 'worker' | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }

    return await getUserType(user.id);
  } catch (error) {
    console.error('Error obteniendo usuario actual:', error);
    return null;
  }
};
