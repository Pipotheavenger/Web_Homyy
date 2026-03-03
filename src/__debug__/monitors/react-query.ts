import { createLogger } from '../utils/logger';
import type { QueryClient } from '@tanstack/react-query';

const log = createLogger('QUERY');

export interface QueryMonitorState {
  latestSnapshot: {
    timestamp: number;
    totalQueries: number;
    activeQueries: number;
    failedQueries: number;
    fetchingQueries: number;
  } | null;
  recentFailures: Array<{
    timestamp: number;
    queryKey: string;
    error: string;
    failureCount: number;
  }>;
  snapshotHistory: Array<{
    timestamp: number;
    totalQueries: number;
    activeQueries: number;
    failedQueries: number;
    fetchingQueries: number;
  }>;
}

export function createReactQueryMonitor(queryClient: QueryClient) {
  const cacheSnapshots: QueryMonitorState['snapshotHistory'] = [];
  const failedQueryLog: QueryMonitorState['recentFailures'] = [];

  let snapshotInterval: ReturnType<typeof setInterval> | null = null;
  let unsubscribeCache: (() => void) | null = null;

  const takeSnapshot = () => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();

    const snapshot = {
      timestamp: Date.now(),
      totalQueries: queries.length,
      activeQueries: queries.filter((q) => q.state.status === 'success' || q.state.status === 'error').length,
      failedQueries: queries.filter((q) => q.state.status === 'error').length,
      fetchingQueries: queries.filter((q) => q.state.fetchStatus === 'fetching').length,
    };

    cacheSnapshots.push(snapshot);
    if (cacheSnapshots.length > 60) {
      cacheSnapshots.shift();
    }

    if (snapshot.fetchingQueries > 5) {
      log.warn(`High concurrent fetches: ${snapshot.fetchingQueries}`, {
        fetching: queries
          .filter((q) => q.state.fetchStatus === 'fetching')
          .map((q) => JSON.stringify(q.queryKey)),
      });
    }

    if (snapshot.failedQueries > 0) {
      log.warn(`Failed queries: ${snapshot.failedQueries}`, {
        failed: queries
          .filter((q) => q.state.status === 'error')
          .map((q) => ({
            key: JSON.stringify(q.queryKey),
            error: (q.state.error as Error)?.message,
            failureCount: q.state.fetchFailureCount,
          })),
      });
    }

    return snapshot;
  };

  const start = () => {
    log.info('React Query Monitor started');

    const initial = takeSnapshot();
    log.info('Initial cache state', initial);

    const cache = queryClient.getQueryCache();
    unsubscribeCache = cache.subscribe((event) => {
      if (!event?.query) return;

      const queryKey = JSON.stringify(event.query.queryKey);

      if (event.type === 'updated') {
        const action = event.action as { type: string; error?: Error } | undefined;
        if (action?.type === 'error') {
          const error = action.error;
          log.error(`Query failed: ${queryKey}`, {
            error: error?.message,
            failureCount: event.query.state.fetchFailureCount,
          });
          failedQueryLog.push({
            timestamp: Date.now(),
            queryKey,
            error: error?.message || 'unknown',
            failureCount: event.query.state.fetchFailureCount,
          });
          if (failedQueryLog.length > 50) {
            failedQueryLog.shift();
          }

          if (
            error?.message?.includes('autenticado') ||
            error?.message?.includes('Refresh Token') ||
            error?.message?.includes('JWT') ||
            error?.message?.includes('401')
          ) {
            log.error('*** AUTH-RELATED QUERY FAILURE detected ***', {
              queryKey,
              error: error.message,
              suggestion: 'Check Auth Session Monitor for session state',
            });
          }
        }

        if (action?.type === 'fetch') {
          log.debug(`Query fetching: ${queryKey}`);
        }

        if (action?.type === 'success') {
          log.debug(`Query success: ${queryKey}`);
        }
      }

      if (event.type === 'removed') {
        log.debug(`Query removed from cache: ${queryKey}`);
      }
    });

    snapshotInterval = setInterval(() => {
      takeSnapshot();
    }, 15000);

    log.info('React Query config analysis', {
      defaultStaleTime: queryClient.getDefaultOptions().queries?.staleTime,
      defaultGcTime: queryClient.getDefaultOptions().queries?.gcTime,
      refetchOnWindowFocus: queryClient.getDefaultOptions().queries?.refetchOnWindowFocus,
      refetchOnMount: queryClient.getDefaultOptions().queries?.refetchOnMount,
      refetchOnReconnect: queryClient.getDefaultOptions().queries?.refetchOnReconnect,
      warning: 'staleTime: 0 means ALL queries refetch on every mount and window focus!',
    });
  };

  const stop = () => {
    if (snapshotInterval) clearInterval(snapshotInterval);
    unsubscribeCache?.();
    log.info('React Query Monitor stopped');
  };

  const getState = (): QueryMonitorState => ({
    latestSnapshot: cacheSnapshots[cacheSnapshots.length - 1] || null,
    recentFailures: failedQueryLog.slice(-10),
    snapshotHistory: [...cacheSnapshots],
  });

  return { start, stop, getState };
}
