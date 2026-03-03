'use client';

import React, { useState, useEffect } from 'react';
import { useDebugContext } from './DebugProvider';
import { getLogBuffer } from './utils/logger';
import { getRenderState } from './monitors/render-cycles';
import type { AuthMonitorState } from './monitors/auth-session';
import type { MemoryMonitorState } from './monitors/memory-leaks';
import type { QueryMonitorState } from './monitors/react-query';
import type { NetworkMonitorState } from './monitors/network';

type TabId = 'auth' | 'memory' | 'query' | 'network' | 'render' | 'logs';

function AuthTab({ state }: { state: AuthMonitorState | null }) {
  if (!state) return <p className="text-gray-500">Monitor not initialized</p>;
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <span>Session:</span>
        <span className={state.currentSession ? 'text-green-400' : 'text-red-400'}>
          {state.currentSession ? `Active (${state.currentSession.userId?.slice(0, 8)}...)` : 'No session'}
        </span>
      </div>
      {state.currentSession?.expiresAt && (
        <div className="flex justify-between">
          <span>Expires:</span>
          <span className={state.currentSession.isExpired ? 'text-red-400' : 'text-gray-300'}>
            {new Date(state.currentSession.expiresAt * 1000).toLocaleTimeString()}
            {state.currentSession.isExpired && ' (EXPIRED!)'}
          </span>
        </div>
      )}
      <div className="flex justify-between">
        <span>Token Refreshes:</span>
        <span>{state.tokenRefreshCount}</span>
      </div>
      <div className="flex justify-between">
        <span>Auth Errors:</span>
        <span className={state.errorCount > 0 ? 'text-red-400 font-bold' : ''}>{state.errorCount}</span>
      </div>
      {state.lastError && (
        <div className="bg-red-900/30 p-2 rounded text-red-300 break-words">Last error: {state.lastError}</div>
      )}
      <div className="mt-2">
        <p className="text-gray-500 mb-1">Recent events ({state.events?.length || 0}):</p>
        <div className="space-y-1 max-h-32 overflow-auto">
          {state.events
            ?.slice(-10)
            .reverse()
            .map((e, i) => (
              <div key={i} className="text-[10px] text-gray-400">
                {new Date(e.timestamp).toLocaleTimeString()} - {e.event}
                {e.error && <span className="text-red-400"> ({e.error})</span>}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function MemoryTab({ state }: { state: MemoryMonitorState | null }) {
  if (!state) return <p className="text-gray-500">Monitor not initialized</p>;
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <span>Active Intervals:</span>
        <span className={state.activeIntervals > 5 ? 'text-red-400 font-bold' : ''}>
          {state.activeIntervals}
        </span>
      </div>
      <div className="flex justify-between">
        <span>Active Timeouts:</span>
        <span>{state.activeTimeouts}</span>
      </div>
      {state.intervalDetails?.length > 0 && (
        <div>
          <p className="text-gray-500 mb-1">Interval details:</p>
          {state.intervalDetails.map((d, i) => (
            <div key={i} className="text-[10px] bg-gray-800 p-1 rounded mb-1">
              <div className="text-yellow-300">
                {d.label} (running {d.age})
              </div>
              <div className="text-gray-500 break-words">{d.stack}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function QueryTab({ state }: { state: QueryMonitorState | null }) {
  if (!state) return <p className="text-gray-500">Monitor not initialized</p>;
  const snap = state.latestSnapshot;
  return (
    <div className="space-y-2">
      {snap && (
        <>
          <div className="flex justify-between">
            <span>Cache Size:</span>
            <span>{snap.totalQueries}</span>
          </div>
          <div className="flex justify-between">
            <span>Fetching:</span>
            <span>{snap.fetchingQueries}</span>
          </div>
          <div className="flex justify-between">
            <span>Failed:</span>
            <span className={snap.failedQueries > 0 ? 'text-red-400' : ''}>{snap.failedQueries}</span>
          </div>
        </>
      )}
      {state.recentFailures?.length > 0 && (
        <div>
          <p className="text-gray-500 mb-1">Recent failures:</p>
          {state.recentFailures.slice(-5).map((f, i) => (
            <div key={i} className="text-[10px] bg-red-900/20 p-1 rounded mb-1 text-red-300 break-words">
              {f.queryKey}: {f.error}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NetworkTab({ state }: { state: NetworkMonitorState | null }) {
  if (!state) return <p className="text-gray-500">Monitor not initialized</p>;
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <span>Total Requests:</span>
        <span>{state.stats.totalRequests}</span>
      </div>
      <div className="flex justify-between">
        <span>Failed:</span>
        <span className={state.stats.failedRequests > 0 ? 'text-red-400' : ''}>
          {state.stats.failedRequests}
        </span>
      </div>
      <div className="flex justify-between">
        <span>Auth Errors:</span>
        <span className={state.stats.authErrors > 0 ? 'text-red-400 font-bold' : ''}>
          {state.stats.authErrors}
        </span>
      </div>
      <div className="mt-2">
        <p className="text-gray-500 mb-1">Recent requests:</p>
        <div className="space-y-1 max-h-40 overflow-auto">
          {state.recentRequests
            ?.slice(-10)
            .reverse()
            .map((r, i) => (
              <div
                key={i}
                className={`text-[10px] p-1 rounded ${r.isAuthError ? 'bg-red-900/20 text-red-300' : 'text-gray-400'}`}
              >
                {r.method} {r.status || 'ERR'} {r.url.slice(0, 60)}
                {r.url.length > 60 ? '...' : ''} ({r.duration}ms)
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function RenderTab() {
  const renderState = getRenderState();
  return (
    <div className="space-y-1">
      {renderState.length === 0 && (
        <p className="text-gray-500">No components tracked. Add useRenderTracker() to components.</p>
      )}
      {renderState.slice(0, 15).map((r, i) => (
        <div key={i} className="flex justify-between text-[10px]">
          <span className={r.rendersInLastSecond > 5 ? 'text-red-400' : 'text-gray-300'}>
            {r.componentName}
          </span>
          <span>
            {r.renderCount} renders ({r.rendersInLastSecond}/s)
          </span>
        </div>
      ))}
    </div>
  );
}

function LogsTab() {
  const logs = [...getLogBuffer()].reverse().slice(0, 50);
  return (
    <div className="space-y-1 max-h-60 overflow-auto">
      {logs.map((entry, i) => (
        <div
          key={i}
          className={`text-[10px] ${
            entry.level === 'error'
              ? 'text-red-400'
              : entry.level === 'warn'
                ? 'text-yellow-400'
                : 'text-gray-400'
          }`}
        >
          [{new Date(entry.timestamp).toLocaleTimeString()}] [{entry.monitor}] {entry.message}
        </div>
      ))}
    </div>
  );
}

const TABS: { id: TabId; label: string }[] = [
  { id: 'auth', label: 'Auth' },
  { id: 'memory', label: 'Memory' },
  { id: 'query', label: 'Query' },
  { id: 'network', label: 'Network' },
  { id: 'render', label: 'Render' },
  { id: 'logs', label: 'Logs' },
];

export function DebugPanel() {
  const { monitors, downloadSnapshot, copyReport } = useDebugContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('auth');
  const [refreshKey, setRefreshKey] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleCopyReport = async () => {
    await copyReport();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (!isOpen || isMinimized) return;
    const interval = setInterval(() => setRefreshKey((k) => k + 1), 2000);
    return () => clearInterval(interval);
  }, [isOpen, isMinimized]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        setIsMinimized(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          setIsOpen(true);
          setIsMinimized(false);
        }}
        className="fixed bottom-4 right-4 z-[99999] bg-gray-900 text-white px-3 py-2 rounded-full shadow-lg text-xs font-mono hover:bg-gray-700 transition-all opacity-50 hover:opacity-100"
        title="Open Debug Panel (Ctrl+Shift+D)"
      >
        DEBUG
      </button>
    );
  }

  const authState = monitors.auth?.getState() ?? null;
  const memoryState = monitors.memory?.getState() ?? null;
  const queryState = monitors.query?.getState() ?? null;
  const networkState = monitors.network?.getState() ?? null;

  // Force use refreshKey to trigger re-reads
  void refreshKey;

  return (
    <div
      className="fixed bottom-4 right-4 z-[99999] bg-gray-900 text-white rounded-xl shadow-2xl font-mono text-xs overflow-hidden"
      style={{ width: isMinimized ? '200px' : '480px', maxHeight: '70vh' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-800 border-b border-gray-700">
        <span className="font-bold text-yellow-400">HOMMY DEBUG</span>
        <div className="flex gap-1">
          <button
            onClick={handleCopyReport}
            className={`px-2 py-0.5 rounded text-[10px] transition-all ${
              copied ? 'bg-green-600' : 'bg-purple-600 hover:bg-purple-500'
            }`}
          >
            {copied ? 'COPIADO!' : 'COPIAR REPORTE'}
          </button>
          <button
            onClick={downloadSnapshot}
            className="px-2 py-0.5 bg-blue-600 rounded text-[10px] hover:bg-blue-500"
          >
            JSON
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="px-2 py-0.5 bg-gray-600 rounded text-[10px] hover:bg-gray-500"
          >
            {isMinimized ? 'EXPAND' : 'MINI'}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="px-2 py-0.5 bg-red-600 rounded text-[10px] hover:bg-red-500"
          >
            X
          </button>
        </div>
      </div>

      {isMinimized ? (
        <div className="px-3 py-2 space-y-1">
          <div className="flex justify-between">
            <span>Auth:</span>
            <span className={authState?.currentSession ? 'text-green-400' : 'text-red-400'}>
              {authState?.currentSession ? 'Active' : 'None'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Intervals:</span>
            <span className={(memoryState?.activeIntervals ?? 0) > 5 ? 'text-yellow-400' : 'text-green-400'}>
              {memoryState?.activeIntervals ?? '?'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Auth Errors:</span>
            <span className={(authState?.errorCount ?? 0) > 0 ? 'text-red-400' : 'text-green-400'}>
              {authState?.errorCount ?? 0}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Net Errors:</span>
            <span className={(networkState?.stats?.failedRequests ?? 0) > 0 ? 'text-red-400' : 'text-green-400'}>
              {networkState?.stats?.failedRequests ?? 0}
            </span>
          </div>
        </div>
      ) : (
        <div>
          {/* Tab bar */}
          <div className="flex bg-gray-800 border-b border-gray-700 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 text-[10px] whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-gray-700 text-yellow-400 border-b-2 border-yellow-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-3 overflow-auto" style={{ maxHeight: '50vh' }}>
            {activeTab === 'auth' && <AuthTab state={authState} />}
            {activeTab === 'memory' && <MemoryTab state={memoryState} />}
            {activeTab === 'query' && <QueryTab state={queryState} />}
            {activeTab === 'network' && <NetworkTab state={networkState} />}
            {activeTab === 'render' && <RenderTab />}
            {activeTab === 'logs' && <LogsTab />}
          </div>
        </div>
      )}
    </div>
  );
}
