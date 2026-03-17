import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const STORAGE_KEY = 'sb-hommy-auth'
const ADMIN_STORAGE_KEY = 'admin-hommy-auth'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    ...(typeof window !== 'undefined' && {
      storage: window.sessionStorage,
      storageKey: STORAGE_KEY,
    }),
  }
})

// Close BroadcastChannel to prevent cross-tab auth interference.
// With a fixed storageKey, all tabs share the same channel name.
// Without closing, signOut/tokenRefresh in one tab cascades to all others.
// Each tab has its own sessionStorage, so cross-tab sync is unnecessary.
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const authClient = supabase.auth as any
  if (authClient.broadcastChannel) {
    authClient.broadcastChannel.close()
    authClient.broadcastChannel = null
  }
}

// Isolated Supabase client for admin panel — uses a separate storageKey
// so admin login/logout doesn't interfere with the regular user's session.
// Lazy-initialized: only created when admin pages actually need it,
// so regular user pages never pay the cost of a second auto-refresh interval.
let _supabaseAdmin: typeof supabase | null = null

export function getSupabaseAdmin(): typeof supabase {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        ...(typeof window !== 'undefined' && {
          storage: window.sessionStorage,
          storageKey: ADMIN_STORAGE_KEY,
        }),
      }
    })
    // Close BroadcastChannel for admin client too
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const adminAuth = _supabaseAdmin.auth as any
      if (adminAuth.broadcastChannel) {
        adminAuth.broadcastChannel.close()
        adminAuth.broadcastChannel = null
      }
    }
  }
  return _supabaseAdmin
}
