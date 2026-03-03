import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const checks = {
    status: 'ok' as 'ok' | 'degraded' | 'down',
    timestamp: new Date().toISOString(),
    supabase: false,
    uptime: process.uptime(),
  };

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { error } = await supabase.from('user_profiles').select('id').limit(1);
    checks.supabase = !error;
    if (error) checks.status = 'degraded';
  } catch {
    checks.supabase = false;
    checks.status = 'degraded';
  }

  const httpStatus = checks.status === 'down' ? 503 : 200;
  return NextResponse.json(checks, { status: httpStatus });
}
