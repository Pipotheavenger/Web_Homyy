import { supabase } from './supabase';

export interface UserProfile {
  user_type: 'user' | 'worker';
  name: string;
  phone: string | null;
}

export type UserProfileLookupStatus = 'found' | 'missing' | 'error';

export interface UserProfileLookupResult {
  profile: UserProfile | null;
  status: UserProfileLookupStatus;
  error: string | null;
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
  const result = await getUserProfileResult(userId);
  return result.profile;
};

/**
 * Obtiene el perfil completo del usuario diferenciando
 * entre perfil faltante y error real de consulta.
 */
export const getUserProfileResult = async (
  userId: string
): Promise<UserProfileLookupResult> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('user_type, name, phone')
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
      return {
        profile: null,
        status: 'error',
        error: error.message || 'Error consultando el perfil del usuario',
      };
    }

    if (!data) {
      return {
        profile: null,
        status: 'missing',
        error: null,
      };
    }

    return {
      profile: data,
      status: 'found',
      error: null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error inesperado obteniendo perfil de usuario:',
      message,
      { userId }
    );
    return {
      profile: null,
      status: 'error',
      error: message,
    };
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
