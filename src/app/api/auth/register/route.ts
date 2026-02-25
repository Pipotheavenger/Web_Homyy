import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface RegisterBody {
  userType: 'user' | 'worker';
  email: string;
  password: string;
  fullName: string;
  phone: string;
  birthDate: string;
  // Worker-only fields
  profession?: string;
  experienceYears?: number;
  selectedCategories?: string[];
  profileDescription?: string;
  certifications?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: RegisterBody = await request.json();

    const {
      userType,
      email,
      password,
      fullName,
      phone,
      birthDate,
      profession,
      experienceYears,
      selectedCategories,
      profileDescription,
      certifications,
    } = body;

    // 1. Validar campos requeridos
    if (!userType || !email || !password || !fullName || !phone || !birthDate) {
      return NextResponse.json(
        { error: 'Todos los campos obligatorios son requeridos' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    if (userType === 'worker' && (!profession || experienceYears === undefined || !selectedCategories || !profileDescription)) {
      return NextResponse.json(
        { error: 'Los campos de trabajador son requeridos' },
        { status: 400 }
      );
    }

    // 2. Verificar que el teléfono fue verificado via OTP
    const digits = phone.replace(/\s/g, '');
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

    const { data: verification, error: verifyError } = await supabaseAdmin
      .from('phone_verifications')
      .select('id')
      .eq('phone_number', digits)
      .eq('verified', true)
      .gte('created_at', thirtyMinutesAgo)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (verifyError || !verification) {
      return NextResponse.json(
        { error: 'El teléfono no ha sido verificado. Completa la verificación OTP primero.' },
        { status: 403 }
      );
    }

    // 3. Crear usuario en Supabase Auth con admin API
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      phone_confirm: true,
      user_metadata: {
        full_name: fullName,
        phone,
        birth_date: birthDate,
      },
    });

    if (authError) {
      let errorMessage = 'Error al crear la cuenta. Inténtalo de nuevo.';

      if (authError.message.includes('already been registered') || authError.message.includes('already exists')) {
        errorMessage = 'Este correo electrónico ya está registrado';
      } else if (authError.message.includes('Password should be at least 6 characters')) {
        errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      } else if (authError.message.includes('Invalid email')) {
        errorMessage = 'El correo electrónico no es válido';
      }

      return NextResponse.json({ error: errorMessage }, { status: 409 });
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'No se pudo crear el usuario' },
        { status: 500 }
      );
    }

    const userId = authData.user.id;

    // 4. Crear perfil de usuario y (si aplica) perfil de trabajador
    try {
      const { error: profileError } = await supabaseAdmin.rpc('create_user_profile', {
        p_user_id: userId,
        p_email: email,
        p_name: fullName,
        p_user_type: userType,
        p_phone: phone,
        p_birth_date: birthDate,
      });

      if (profileError) {
        throw new Error(profileError.message || 'Error al crear el perfil de usuario');
      }

      if (userType === 'worker') {
        const { error: workerError } = await supabaseAdmin.rpc('create_worker_profile', {
          p_user_id: userId,
          p_profession: profession,
          p_experience_years: experienceYears,
          p_bio: profileDescription,
          p_profile_description: profileDescription,
          p_categories: selectedCategories,
          p_certifications: certifications || [],
        });

        if (workerError) {
          throw new Error(workerError.message || 'Error al crear el perfil de trabajador');
        }
      }

      // 5. Marcar movil_verificado en perfiles
      await supabaseAdmin
        .from('user_profiles')
        .update({ movil_verificado: true })
        .eq('user_id', userId);

      if (userType === 'worker') {
        await supabaseAdmin
          .from('worker_profiles')
          .update({ movil_verificado: true })
          .eq('user_id', userId);
      }
    } catch (profileError) {
      // Rollback: eliminar el usuario auth si falla la creación de perfiles
      console.error('Error creando perfiles, eliminando usuario auth:', profileError);
      await supabaseAdmin.auth.admin.deleteUser(userId);

      let errorMessage = 'Error al crear la cuenta. Inténtalo de nuevo.';
      if (profileError instanceof Error && profileError.message.includes('duplicate key value')) {
        errorMessage = 'Este correo electrónico ya está en uso';
      }

      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    return NextResponse.json({ success: true, userId });
  } catch (error) {
    console.error('❌ Error en /api/auth/register:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al crear la cuenta. Inténtalo de nuevo.' },
      { status: 500 }
    );
  }
}
