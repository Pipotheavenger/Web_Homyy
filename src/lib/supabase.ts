import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Obtener la URL base dinámicamente
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
}

// Generate a unique storage key per tab.
// sessionStorage persists across reloads but is isolated per tab,
// so each tab gets its own independent auth session.
// The unique storageKey also isolates BroadcastChannel events,
// preventing cross-tab auth interference.
function getTabStorageKey(): string {
  if (typeof window === 'undefined') return 'sb-server-auth'
  let tabId = sessionStorage.getItem('hommy-tab-id')
  if (!tabId) {
    tabId = crypto.randomUUID()
    sessionStorage.setItem('hommy-tab-id', tabId)
  }
  return `sb-auth-${tabId}`
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    ...(typeof window !== 'undefined' && {
      storage: window.sessionStorage,
      storageKey: getTabStorageKey(),
    }),
  }
})

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
          storageKey: `admin-${getTabStorageKey()}`,
        }),
      }
    })
  }
  return _supabaseAdmin
}
