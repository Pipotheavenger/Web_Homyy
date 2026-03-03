import { createLogger } from '../utils/logger';

const log = createLogger('NETWORK');

export interface NetworkRequest {
  id: number;
  timestamp: number;
  method: string;
  url: string;
  status: number | null;
  duration: number | null;
  error: string | null;
  isSupabase: boolean;
  isAuthError: boolean;
}

export interface NetworkMonitorState {
  recentRequests: NetworkRequest[];
  stats: {
    totalRequests: number;
    failedRequests: number;
    authErrors: number;
  };
  supabaseRequests: number;
  authErrors: NetworkRequest[];
}

let requestId = 0;

export function createNetworkMonitor(supabaseUrl: string) {
  const requests: NetworkRequest[] = [];
  const stats = {
    totalRequests: 0,
    failedRequests: 0,
    authErrors: 0,
  };

  const MAX_REQUESTS = 200;
  let originalFetch: typeof fetch | null = null;

  const addRequest = (req: NetworkRequest) => {
    requests.push(req);
    if (requests.length > MAX_REQUESTS) {
      requests.shift();
    }
    stats.totalRequests++;
    if (req.error || (req.status && req.status >= 400)) {
      stats.failedRequests++;
    }
    if (req.isAuthError) {
      stats.authErrors++;
    }
  };

  const patchFetch = () => {
    originalFetch = window.fetch.bind(window);
    const savedFetch = originalFetch;

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;
      const method = init?.method || 'GET';
      const id = ++requestId;
      const startTime = Date.now();
      const isSupabase = url.includes(supabaseUrl) || url.includes('supabase');

      try {
        const response = await savedFetch(input, init);
        const duration = Date.now() - startTime;
        const isAuthError = response.status === 401 || response.status === 403;

        const req: NetworkRequest = {
          id,
          timestamp: startTime,
          method,
          url: url.length > 200 ? url.slice(0, 200) + '...' : url,
          status: response.status,
          duration,
          error: null,
          isSupabase,
          isAuthError,
        };
        addRequest(req);

        if (isSupabase) {
          const shortUrl = url.replace(supabaseUrl, '[SUPABASE]');
          if (isAuthError) {
            log.error(`Supabase auth error: ${method} ${response.status}`, {
              url: shortUrl,
              duration: `${duration}ms`,
            });
          } else if (response.status >= 400) {
            log.warn(`Supabase error: ${method} ${response.status}`, {
              url: shortUrl,
              duration: `${duration}ms`,
            });
          } else {
            log.debug(`Supabase: ${method} ${response.status}`, {
              url: shortUrl,
              duration: `${duration}ms`,
            });
          }
        }

        return response;
      } catch (err: unknown) {
        const duration = Date.now() - startTime;
        const message = err instanceof Error ? err.message : 'Unknown error';
        const req: NetworkRequest = {
          id,
          timestamp: startTime,
          method,
          url: url.length > 200 ? url.slice(0, 200) + '...' : url,
          status: null,
          duration,
          error: message,
          isSupabase,
          isAuthError: false,
        };
        addRequest(req);

        log.error(`Network error: ${method} failed`, {
          url: isSupabase ? url.replace(supabaseUrl, '[SUPABASE]') : url,
          error: message,
          duration: `${duration}ms`,
        });

        throw err;
      }
    };
  };

  const unpatchFetch = () => {
    if (originalFetch) {
      window.fetch = originalFetch;
    }
  };

  const start = () => {
    log.info('Network Monitor started', { supabaseUrl: supabaseUrl.slice(0, 30) + '...' });
    patchFetch();
  };

  const stop = () => {
    unpatchFetch();
    log.info('Network Monitor stopped');
  };

  const getState = (): NetworkMonitorState => ({
    recentRequests: requests.slice(-20),
    stats: { ...stats },
    supabaseRequests: requests.filter((r) => r.isSupabase).length,
    authErrors: requests.filter((r) => r.isAuthError),
  });

  return { start, stop, getState };
}
