import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const STORAGE_KEY = 'sb-hommy-auth'
const ADMIN_STORAGE_KEY = 'admin-hommy-auth'

export const SESSION_SCOPE_STORAGE_KEY = 'hommy-tab-id'
export const ADMIN_AUTH_FLAG_KEY = 'admin_authenticated'
export const ADMIN_AUTH_COOKIE_NAME = 'admin_authenticated'
export const ADMIN_EMAIL = 'admin@hommy.app'

const SESSION_SCOPE_SEPARATOR = ':'

const generateSessionScopeId = () => {
  if (globalThis.crypto !== undefined && typeof globalThis.crypto.randomUUID === 'function') {
    return globalThis.crypto.randomUUID()
  }

  return `tab_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}

const readSessionStorage = (key: string): string | null => {
  try {
    return globalThis.window.sessionStorage.getItem(key)
  } catch {
    return null
  }
}

const writeSessionStorage = (key: string, value: string) => {
  try {
    globalThis.window.sessionStorage.setItem(key, value)
  } catch {
    // Ignore storage write failures in restrictive browser modes.
  }
}

const removeSessionStorage = (key: string) => {
  try {
    globalThis.window.sessionStorage.removeItem(key)
  } catch {
    // Ignore storage removal failures in restrictive browser modes.
  }
}

const getOrCreateSessionScope = () => {
  if (globalThis.window === undefined) {
    return 'server'
  }

  const existingScope = readSessionStorage(SESSION_SCOPE_STORAGE_KEY)
  if (existingScope) {
    return existingScope
  }

  const nextScope = generateSessionScopeId()
  writeSessionStorage(SESSION_SCOPE_STORAGE_KEY, nextScope)
  return nextScope
}

const resolveScopedStorageKey = (baseKey: string) => {
  if (globalThis.window === undefined) {
    return baseKey
  }

  const scopedKey = `${baseKey}${SESSION_SCOPE_SEPARATOR}${getOrCreateSessionScope()}`
  const scopedValue = readSessionStorage(scopedKey)

  if (scopedValue === null) {
    const legacyValue = readSessionStorage(baseKey)
    if (legacyValue !== null) {
      writeSessionStorage(scopedKey, legacyValue)
      removeSessionStorage(baseKey)
    }
  }

  return scopedKey
}

const buildAuthCookie = (maxAgeSeconds?: number) => {
  const parts = [`${ADMIN_AUTH_COOKIE_NAME}=true`, 'path=/', 'SameSite=Strict']

  if (typeof maxAgeSeconds === 'number') {
    parts.push(`max-age=${maxAgeSeconds}`)
  }

  return parts.join('; ')
}

export const setAdminSessionMarkers = (maxAgeSeconds = 3600) => {
  if (globalThis.window === undefined) return

  writeSessionStorage(ADMIN_AUTH_FLAG_KEY, 'true')
  document.cookie = buildAuthCookie(maxAgeSeconds)
}

export const clearAdminSessionMarkers = () => {
  if (globalThis.window === undefined) return

  removeSessionStorage(ADMIN_AUTH_FLAG_KEY)
  document.cookie = `${ADMIN_AUTH_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict`
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    ...(globalThis.window !== undefined && {
      storage: globalThis.window.sessionStorage,
      // Scope auth storage to the current tab session.
      // A duplicated tab clones sessionStorage and therefore keeps the same scope,
      // while a fresh tab gets a brand-new scope and stays isolated.
      storageKey: resolveScopedStorageKey(STORAGE_KEY),
    }),
  }
})

// Isolated Supabase client for admin panel — uses a separate storageKey
// so admin login/logout doesn't interfere with the regular user's session.
// Lazy-initialized: only created when admin pages actually need it,
// so regular user pages never pay the cost of a second auto-refresh interval.
let _supabaseAdmin: typeof supabase | null = null

export function getSupabaseAdmin(): typeof supabase {
  _supabaseAdmin ??= createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      ...(globalThis.window !== undefined && {
        storage: globalThis.window.sessionStorage,
        storageKey: resolveScopedStorageKey(ADMIN_STORAGE_KEY),
      }),
    }
  })
  return _supabaseAdmin
}

export const hasValidAdminSession = async () => {
  const { data: { session }, error } = await getSupabaseAdmin().auth.getSession()
  const isValid = !!session?.user && session.user.email === ADMIN_EMAIL

  if (globalThis.window !== undefined) {
    if (isValid) {
      setAdminSessionMarkers()
    } else {
      clearAdminSessionMarkers()
    }
  }

  return { session, error, isValid }
}

export const ensureAdminSession = async () => {
  const { session, error, isValid } = await hasValidAdminSession()

  if (error || !isValid || !session) {
    throw error ?? new Error('Sesión de admin no válida')
  }

  return session
}

export const clearAdminSession = async () => {
  try {
    await getSupabaseAdmin().auth.signOut()
  } catch (error) {
    console.warn('Error cerrando sesión de admin:', error)
  } finally {
    clearAdminSessionMarkers()
  }
}
