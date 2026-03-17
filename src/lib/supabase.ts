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

// ---------------------------------------------------------------------------
// In-memory lock — replaces navigator.locks to avoid bfcache contention
// on page refresh (old page can hold the lock while the new page loads).
// ---------------------------------------------------------------------------
const tabLocks = new Map<string, Promise<void>>()

async function inMemoryLock<R>(
  name: string,
  _acquireTimeout: number,
  fn: () => Promise<R>
): Promise<R> {
  const prev = tabLocks.get(name) ?? Promise.resolve()
  let release!: () => void
  const current = new Promise<void>(r => { release = r })
  tabLocks.set(name, current)
  try {
    await prev
    return await fn()
  } finally {
    release()
    if (tabLocks.get(name) === current) tabLocks.delete(name)
  }
}

// ---------------------------------------------------------------------------
// Duplicate-tab detection (synchronous, runs during module evaluation).
//
// When a tab is duplicated the browser clones sessionStorage into the new tab.
// We detect this by checking the Navigation Timing API:
//   - "reload"       → page refresh  → keep session
//   - "back_forward" → history nav   → keep session
//   - "navigate"     → new navigation; if sessionStorage already contains
//                      hommy-tab-id it means the data was *cloned* from
//                      the parent tab → duplicate → clear session
// ---------------------------------------------------------------------------
const purgeDuplicateTabSession = () => {
  if (globalThis.window === undefined) return

  let navType = 'navigate'
  try {
    const entries = performance.getEntriesByType('navigation')
    if (entries.length > 0) {
      navType = (entries[0] as PerformanceNavigationTiming).type
    }
  } catch {
    // ignore — fallback below handles both exception and empty-entries cases
  }

  // Always try deprecated API when modern API didn't resolve navType.
  // performance.getEntriesByType('navigation') can return [] during very early
  // module evaluation; without this fallback, navType stays 'navigate' and the
  // function incorrectly purges the session on a page refresh.
  if (navType === 'navigate' && typeof performance !== 'undefined' && performance.navigation) {
    const legacyType = performance.navigation.type
    if (legacyType === 1) navType = 'reload'
    else if (legacyType === 2) navType = 'back_forward'
  }

  // Reload / back-forward → same tab, keep everything
  if (navType !== 'navigate') return

  // "navigate" with no existing tab id → fresh tab, nothing to purge
  if (sessionStorage.getItem(SESSION_SCOPE_STORAGE_KEY) === null) return

  // Duplicate detected: clear all cloned auth data so the new tab starts
  // with a clean slate (will redirect to login).
  const keysToClear = Object.keys(sessionStorage).filter(
    k => k.startsWith('sb-') || k.startsWith('admin-') || k === SESSION_SCOPE_STORAGE_KEY
  )
  for (const k of keysToClear) {
    sessionStorage.removeItem(k)
  }
}

// Run detection immediately during module evaluation, BEFORE createClient.
purgeDuplicateTabSession()

// ---------------------------------------------------------------------------
// Session-scope helpers
// ---------------------------------------------------------------------------

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

export const clearCurrentUserAuthStorage = () => {
  if (globalThis.window === undefined) return
  removeSessionStorage(resolveScopedStorageKey(STORAGE_KEY))
}

export const clearCurrentAdminAuthStorage = () => {
  if (globalThis.window === undefined) return
  removeSessionStorage(resolveScopedStorageKey(ADMIN_STORAGE_KEY))
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
    lock: inMemoryLock,
    ...(globalThis.window !== undefined && {
      storage: globalThis.window.sessionStorage,
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
      lock: inMemoryLock,
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
    await getSupabaseAdmin().auth.signOut({ scope: 'local' })
  } catch (error) {
    console.warn('Error cerrando sesión de admin:', error)
  } finally {
    clearCurrentAdminAuthStorage()
    clearAdminSessionMarkers()
  }
}
