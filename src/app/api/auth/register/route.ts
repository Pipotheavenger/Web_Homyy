import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { normalizePhoneToDigits, phoneToAuthEmail } from '@/lib/utils/phone-auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Service role: creación de usuario sin depender de email (email técnico confirmado al crear)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface RegisterBody {
  userType: 'user' | 'worker';
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
    if (!userType || !password || !fullName || !phone || !birthDate) {
      return NextResponse.json(
        { error: 'Todos los campos obligatorios son requeridos' },
        { status: 400 }
      );
    }

    const phoneDigits = normalizePhoneToDigits(phone);
    if (!/^\d{10}$/.test(phoneDigits)) {
      return NextResponse.json(
        { error: 'El número debe tener exactamente 10 dígitos' },
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

    // 2. Validar que exista una verificación de teléfono vigente
    const { data: verifiedRecord, error: verifiedError } = await supabaseAdmin
      .from('phone_verifications')
      .select('id, expires_at, verified, created_at')
      .eq('phone_number', phoneDigits)
      .eq('verified', true)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (verifiedError) {
      console.error('Error verificando phone_verifications:', verifiedError);
      return NextResponse.json(
        { error: 'No pudimos validar tu verificación de teléfono. Intenta nuevamente.' },
        { status: 500 }
      );
    }

    if (!verifiedRecord) {
      return NextResponse.json(
        { error: 'Debes verificar tu teléfono antes de registrarte' },
        { status: 400 }
      );
    }

    // 3. Crear usuario con Admin API: email técnico marcado confirmado (no hay flujo real por correo)
    const email = phoneToAuthEmail(phoneDigits);
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        phone: phoneDigits,
        birth_date: birthDate,
      },
    });

    if (authError) {
      let errorMessage = 'Error al crear la cuenta. Inténtalo de nuevo.';
      const msg = authError.message || '';

      if (
        msg.includes('already been registered') ||
        msg.includes('already exists') ||
        msg.includes('User already registered') ||
        msg.includes('duplicate')
      ) {
        errorMessage = 'Este número de teléfono ya está registrado';
      } else if (msg.includes('Password should be at least 6 characters')) {
        errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      } else if (msg.includes('Invalid email')) {
        errorMessage = 'No se pudo crear la cuenta con este número';
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

    // 3. Crear perfiles usando service role (bypasa RLS)
    try {
      const { error: profileError } = await supabaseAdmin.rpc('create_user_profile', {
        p_user_id: userId,
        p_email: email,
        p_name: fullName,
        p_user_type: userType,
        p_phone: phoneDigits,
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

      // El OTP ya se validó antes del registro; al crear filas nuevas el RPC no marca móvil.
      const { error: mobileOkError } = await supabaseAdmin
        .from('user_profiles')
        .update({
          movil_verificado: true,
          whatsapp_notifications_enabled: true,
        })
        .eq('user_id', userId);

      if (mobileOkError) {
        console.error('Error marcando movil_verificado en user_profiles:', mobileOkError);
        throw new Error('No se pudo finalizar la verificación del teléfono');
      }

      if (userType === 'worker') {
        await supabaseAdmin
          .from('worker_profiles')
          .update({
            movil_verificado: true,
            whatsapp_notifications_enabled: true,
          })
          .eq('user_id', userId);
      }
    } catch (profileError) {
      // Rollback: eliminar el usuario auth si falla la creación de perfiles
      console.error('Error creando perfiles, eliminando usuario auth:', profileError);
      await supabaseAdmin.auth.admin.deleteUser(userId);

      let errorMessage = 'Error al crear la cuenta. Inténtalo de nuevo.';
      if (profileError instanceof Error && profileError.message.includes('duplicate key value')) {
        errorMessage = 'Este número de teléfono ya está en uso';
      }

      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    return NextResponse.json({ success: true, userId });
  } catch (error) {
    console.error('Error en /api/auth/register:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al crear la cuenta. Inténtalo de nuevo.' },
      { status: 500 }
    );
  }
}
