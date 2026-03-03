'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { createAuthMonitor } from './monitors/auth-session';
import { createMemoryMonitor } from './monitors/memory-leaks';
import { createReactQueryMonitor } from './monitors/react-query';
import { createNetworkMonitor } from './monitors/network';
import { DebugErrorBoundary } from './components/DebugErrorBoundary';
import { DebugPanel } from './DebugPanel';
import { captureSnapshot, downloadSnapshot as dlSnapshot, generateReport } from './utils/snapshot';
import { createLogger, exportLogs } from './utils/logger';

const log = createLogger('SYSTEM');

type AuthMonitor = ReturnType<typeof createAuthMonitor>;
type MemoryMonitor = ReturnType<typeof createMemoryMonitor>;
type QueryMonitor = ReturnType<typeof createReactQueryMonitor>;
type NetworkMonitor = ReturnType<typeof createNetworkMonitor>;

interface MonitorRefs {
  auth: AuthMonitor | null;
  memory: MemoryMonitor | null;
  query: QueryMonitor | null;
  network: NetworkMonitor | null;
}

interface DebugContextValue {
  monitors: MonitorRefs;
  snapshot: () => Promise<void>;
  downloadSnapshot: () => void;
  copyReport: () => Promise<void>;
}

const DebugContext = createContext<DebugContextValue | null>(null);

export const useDebugContext = () => {
  const ctx = useContext(DebugContext);
  if (!ctx) throw new Error('useDebugContext must be used within DebugProvider');
  return ctx;
};

export function DebugProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const monitorsRef = useRef<MonitorRefs>({
    auth: null,
    memory: null,
    query: null,
    network: null,
  });
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    log.info('=== HOMMY DEBUG MODE ACTIVE ===');
    log.info('Press Ctrl+Shift+D to toggle debug panel');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

    const authMonitor = createAuthMonitor(supabase);
    const memoryMonitor = createMemoryMonitor();
    const queryMonitor = createReactQueryMonitor(queryClient);
    const networkMonitor = createNetworkMonitor(supabaseUrl);

    monitorsRef.current = {
      auth: authMonitor,
      memory: memoryMonitor,
      query: queryMonitor,
      network: networkMonitor,
    };

    // Start all monitors
    authMonitor.start();
    memoryMonitor.start();
    queryMonitor.start();
    networkMonitor.start();

    setInitialized(true);

    // Expose debug utilities on window for console access
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__HOMMY_DEBUG__ = {
      monitors: monitorsRef.current,
      snapshot: async () => {
        const snap = await captureSnapshot(supabase, queryClient, {
          intervals: memoryMonitor.getState(),
        });
        console.log('Debug Snapshot:', snap);
        return snap;
      },
      exportLogs: () => exportLogs(),
      copyReport: async () => {
        const snap = await captureSnapshot(supabase, queryClient, {
          intervals: memoryMonitor.getState(),
        });
        const report = generateReport(snap, {
          auth: authMonitor.getState(),
          memory: memoryMonitor.getState(),
          query: queryMonitor.getState(),
          network: networkMonitor.getState(),
        });
        await navigator.clipboard.writeText(report);
        console.log('Debug report copied to clipboard!');
        return report;
      },
    };

    return () => {
      authMonitor.stop();
      memoryMonitor.stop();
      queryMonitor.stop();
      networkMonitor.stop();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).__HOMMY_DEBUG__;
      log.info('Debug mode deactivated');
    };
  }, [queryClient]);

  const handleSnapshot = useCallback(async () => {
    const snap = await captureSnapshot(supabase, queryClient, {
      intervals: monitorsRef.current.memory?.getState(),
    });
    console.log('Debug Snapshot:', snap);
  }, [queryClient]);

  const handleDownloadSnapshot = useCallback(async () => {
    const snap = await captureSnapshot(supabase, queryClient, {
      intervals: monitorsRef.current.memory?.getState(),
    });
    dlSnapshot(snap);
  }, [queryClient]);

  const handleCopyReport = useCallback(async () => {
    const snap = await captureSnapshot(supabase, queryClient, {
      intervals: monitorsRef.current.memory?.getState(),
    });
    const report = generateReport(snap, {
      auth: monitorsRef.current.auth?.getState() ?? null,
      memory: monitorsRef.current.memory?.getState() ?? null,
      query: monitorsRef.current.query?.getState() ?? null,
      network: monitorsRef.current.network?.getState() ?? null,
    });
    await navigator.clipboard.writeText(report);
    log.info('Debug report copied to clipboard');
  }, [queryClient]);

  const contextValue: DebugContextValue = {
    monitors: monitorsRef.current,
    snapshot: handleSnapshot,
    downloadSnapshot: handleDownloadSnapshot,
    copyReport: handleCopyReport,
  };

  return (
    <DebugContext.Provider value={contextValue}>
      <DebugErrorBoundary>
        {children}
        {initialized && <DebugPanel />}
      </DebugErrorBoundary>
    </DebugContext.Provider>
  );
}
