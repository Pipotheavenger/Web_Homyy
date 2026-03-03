import { getLogBuffer, type LogEntry } from './logger';
import type { QueryClient } from '@tanstack/react-query';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface DebugSnapshot {
  timestamp: string;
  url: string;
  userAgent: string;
  localStorage: Record<string, string>;
  sessionStorage: Record<string, string>;
  supabaseSession: {
    hasAccessToken: boolean;
    hasRefreshToken: boolean;
    expiresAt: number | null;
    userId: string | null;
  } | null;
  reactQueryState: {
    cacheSize: number;
    activeQueries: number;
    failedQueries: number;
    fetchingQueries: number;
    queryKeys: string[];
  } | null;
  activeIntervals: number;
  activeSubscriptions: number;
  recentLogs: ReadonlyArray<LogEntry>;
  memoryUsage: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  } | null;
}

function getStorageEntries(storage: Storage): Record<string, string> {
  const entries: Record<string, string> = {};
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key) {
      const value = storage.getItem(key) || '';
      if (key.includes('token') || key.includes('auth') || key.includes('supabase')) {
        entries[key] = `[MASKED: ${value.length} chars]`;
      } else {
        entries[key] = value.length > 200 ? value.slice(0, 200) + '...' : value;
      }
    }
  }
  return entries;
}

export async function captureSnapshot(
  supabaseClient: SupabaseClient,
  queryClient: QueryClient | null,
  debugState: { intervals?: { activeIntervals?: number }; subscriptions?: { size?: number } }
): Promise<DebugSnapshot> {
  let supabaseSession: DebugSnapshot['supabaseSession'] = null;
  try {
    const { data } = await supabaseClient.auth.getSession();
    if (data?.session) {
      supabaseSession = {
        hasAccessToken: !!data.session.access_token,
        hasRefreshToken: !!data.session.refresh_token,
        expiresAt: data.session.expires_at ?? null,
        userId: data.session.user?.id ?? null,
      };
    }
  } catch {
    /* silently handle */
  }

  let reactQueryState: DebugSnapshot['reactQueryState'] = null;
  if (queryClient) {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    reactQueryState = {
      cacheSize: queries.length,
      activeQueries: queries.filter((q) => q.state.status === 'success' || q.state.status === 'error').length,
      failedQueries: queries.filter((q) => q.state.status === 'error').length,
      fetchingQueries: queries.filter((q) => q.state.fetchStatus === 'fetching').length,
      queryKeys: queries.map((q) => JSON.stringify(q.queryKey)),
    };
  }

  let memoryUsage: DebugSnapshot['memoryUsage'] = null;
  const perf = performance as unknown as { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } };
  if (perf.memory) {
    memoryUsage = {
      usedJSHeapSize: perf.memory.usedJSHeapSize,
      totalJSHeapSize: perf.memory.totalJSHeapSize,
      jsHeapSizeLimit: perf.memory.jsHeapSizeLimit,
    };
  }

  return {
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    localStorage: getStorageEntries(localStorage),
    sessionStorage: getStorageEntries(sessionStorage),
    supabaseSession,
    reactQueryState,
    activeIntervals: debugState?.intervals?.activeIntervals ?? 0,
    activeSubscriptions: debugState?.subscriptions?.size ?? 0,
    recentLogs: getLogBuffer().slice(-50),
    memoryUsage,
  };
}

export function downloadSnapshot(snapshot: DebugSnapshot): void {
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `hommy-debug-${snapshot.timestamp.replace(/[:.]/g, '-')}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Generates a compact, human-readable debug report optimized
 * for pasting into a chat with Claude to diagnose issues.
 * Filters out debug-level noise and focuses on errors/warnings.
 */
export function generateReport(
  snapshot: DebugSnapshot,
  monitorStates: {
    auth?: { events: Array<{ timestamp: number; event: string; error?: string }>; tokenRefreshCount: number; errorCount: number; lastError: string | null; currentSession: { userId: string | null; expiresAt: number | null; isExpired: boolean } | null } | null;
    memory?: { activeIntervals: number; activeTimeouts: number; intervalDetails: Array<{ label?: string; age: string; stack: string }> } | null;
    query?: { latestSnapshot: { totalQueries: number; failedQueries: number; fetchingQueries: number } | null; recentFailures: Array<{ queryKey: string; error: string }> } | null;
    network?: { stats: { totalRequests: number; failedRequests: number; authErrors: number }; recentRequests: Array<{ method: string; url: string; status: number | null; duration: number | null; isAuthError: boolean }> } | null;
  }
): string {
  const lines: string[] = [];
  const hr = '─'.repeat(50);

  lines.push('```');
  lines.push('HOMMY DEBUG REPORT');
  lines.push(`Timestamp: ${snapshot.timestamp}`);
  lines.push(`URL: ${snapshot.url}`);
  lines.push(hr);

  // Auth section
  lines.push('');
  lines.push('## AUTH SESSION');
  if (snapshot.supabaseSession) {
    const s = snapshot.supabaseSession;
    const auth = monitorStates.auth;
    lines.push(`  User ID: ${s.userId?.slice(0, 8) ?? 'null'}...`);
    lines.push(`  Has Access Token: ${s.hasAccessToken}`);
    lines.push(`  Has Refresh Token: ${s.hasRefreshToken}`);
    if (s.expiresAt) {
      const expiresDate = new Date(s.expiresAt * 1000);
      const isExpired = expiresDate.getTime() < Date.now();
      lines.push(`  Expires At: ${expiresDate.toISOString()} ${isExpired ? '** EXPIRED **' : ''}`);
    }
    if (auth) {
      lines.push(`  Token Refreshes: ${auth.tokenRefreshCount}`);
      lines.push(`  Auth Errors: ${auth.errorCount}`);
      if (auth.lastError) {
        lines.push(`  Last Error: ${auth.lastError}`);
      }
      if (auth.events.length > 0) {
        lines.push('  Recent Events:');
        auth.events.slice(-10).forEach((e) => {
          const t = new Date(e.timestamp).toISOString().split('T')[1].slice(0, 8);
          lines.push(`    [${t}] ${e.event}${e.error ? ` ERROR: ${e.error}` : ''}`);
        });
      }
    }
  } else {
    lines.push('  NO SESSION FOUND');
  }

  // Memory section
  lines.push('');
  lines.push('## MEMORY / INTERVALS');
  const mem = monitorStates.memory;
  if (mem) {
    lines.push(`  Active Intervals: ${mem.activeIntervals}`);
    lines.push(`  Active Timeouts: ${mem.activeTimeouts}`);
    if (mem.intervalDetails.length > 0) {
      lines.push('  Interval Details:');
      mem.intervalDetails.forEach((d) => {
        lines.push(`    - ${d.label} (running ${d.age})`);
        lines.push(`      Stack: ${d.stack}`);
      });
    }
  }
  if (snapshot.memoryUsage) {
    const mb = (n: number) => (n / 1024 / 1024).toFixed(1);
    lines.push(`  JS Heap: ${mb(snapshot.memoryUsage.usedJSHeapSize)}MB / ${mb(snapshot.memoryUsage.totalJSHeapSize)}MB (limit: ${mb(snapshot.memoryUsage.jsHeapSizeLimit)}MB)`);
  }

  // React Query section
  lines.push('');
  lines.push('## REACT QUERY');
  const rq = monitorStates.query;
  if (rq?.latestSnapshot) {
    const snap = rq.latestSnapshot;
    lines.push(`  Cache Size: ${snap.totalQueries}`);
    lines.push(`  Failed: ${snap.failedQueries}`);
    lines.push(`  Fetching: ${snap.fetchingQueries}`);
  }
  if (rq?.recentFailures && rq.recentFailures.length > 0) {
    lines.push('  Recent Failures:');
    rq.recentFailures.slice(-10).forEach((f) => {
      lines.push(`    - ${f.queryKey}: ${f.error}`);
    });
  }

  // Network section
  lines.push('');
  lines.push('## NETWORK');
  const net = monitorStates.network;
  if (net) {
    lines.push(`  Total Requests: ${net.stats.totalRequests}`);
    lines.push(`  Failed: ${net.stats.failedRequests}`);
    lines.push(`  Auth Errors (401/403): ${net.stats.authErrors}`);
    const errorRequests = net.recentRequests.filter((r) => r.isAuthError || (r.status && r.status >= 400));
    if (errorRequests.length > 0) {
      lines.push('  Failed Requests:');
      errorRequests.slice(-10).forEach((r) => {
        lines.push(`    - ${r.method} ${r.status ?? 'ERR'} ${r.url.slice(0, 80)} (${r.duration}ms)`);
      });
    }
  }

  // Logs section - only warnings and errors
  lines.push('');
  lines.push('## RECENT LOGS (warnings & errors only)');
  const importantLogs = [...snapshot.recentLogs].filter(
    (l) => l.level === 'warn' || l.level === 'error'
  );
  if (importantLogs.length === 0) {
    lines.push('  No warnings or errors.');
  } else {
    importantLogs.slice(-30).forEach((entry) => {
      const t = new Date(entry.timestamp).toISOString().split('T')[1].slice(0, 8);
      const level = entry.level.toUpperCase();
      let line = `  [${t}] [${level}] [${entry.monitor}] ${entry.message}`;
      if (entry.data) {
        try {
          const dataStr = JSON.stringify(entry.data);
          if (dataStr.length <= 200) {
            line += ` ${dataStr}`;
          } else {
            line += ` ${dataStr.slice(0, 200)}...`;
          }
        } catch {
          /* skip unserializable data */
        }
      }
      lines.push(line);
    });
  }

  // Storage keys (just key names, not values)
  lines.push('');
  lines.push('## STORAGE KEYS');
  lines.push(`  localStorage: ${Object.keys(snapshot.localStorage).join(', ') || 'empty'}`);
  lines.push(`  sessionStorage: ${Object.keys(snapshot.sessionStorage).join(', ') || 'empty'}`);

  lines.push('```');

  return lines.join('\n');
}
