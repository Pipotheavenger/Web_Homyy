import { createLogger } from '../utils/logger';

const log = createLogger('MEMORY');

export interface TrackedResource {
  id: number;
  type: 'interval' | 'timeout';
  createdAt: number;
  stackTrace: string;
  label?: string;
  cleared: boolean;
}

export interface MemoryMonitorState {
  activeIntervals: number;
  activeTimeouts: number;
  componentMounts: Record<string, { mountCount: number; unmountCount: number; currentlyMounted: number }>;
  intervalDetails: Array<{ label?: string; age: string; stack: string }>;
}

let resourceId = 0;

export function createMemoryMonitor() {
  const intervals = new Map<number, TrackedResource>();
  const timeouts = new Map<number, TrackedResource>();
  const componentMounts = new Map<string, { mountCount: number; unmountCount: number; currentlyMounted: number }>();

  const originalSetInterval = window.setInterval.bind(window);
  const originalClearInterval = window.clearInterval.bind(window);
  const originalSetTimeout = window.setTimeout.bind(window);
  const originalClearTimeout = window.clearTimeout.bind(window);

  let leakCheckInterval: number | null = null;

  const getStack = (): string => {
    try {
      const stack = new Error().stack || '';
      return stack
        .split('\n')
        .slice(2, 5)
        .map((l) => l.trim())
        .join(' | ');
    } catch {
      return 'stack unavailable';
    }
  };

  const patchTimers = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).setInterval = (handler: TimerHandler, ms?: number, ...args: unknown[]) => {
      const id = originalSetInterval(handler, ms, ...args);
      const resource: TrackedResource = {
        id: ++resourceId,
        type: 'interval',
        createdAt: Date.now(),
        stackTrace: getStack(),
        label: `${ms}ms interval`,
        cleared: false,
      };
      intervals.set(id as unknown as number, resource);

      if (ms && ms <= 60000) {
        log.info(`setInterval created (${ms}ms)`, {
          id,
          stack: resource.stackTrace,
          activeCount: intervals.size,
        });
      }

      if (intervals.size > 5) {
        log.warn(`High interval count: ${intervals.size} active intervals`, {
          intervals: Array.from(intervals.values()).map((r) => ({
            label: r.label,
            age: `${Math.round((Date.now() - r.createdAt) / 1000)}s`,
            stack: r.stackTrace,
          })),
        });
      }

      return id;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).clearInterval = (id: number) => {
      const resource = intervals.get(id);
      if (resource) {
        resource.cleared = true;
        intervals.delete(id);
        log.debug('clearInterval called', {
          id,
          wasActiveFor: `${Math.round((Date.now() - resource.createdAt) / 1000)}s`,
        });
      }
      return originalClearInterval(id);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).setTimeout = (handler: TimerHandler, ms?: number, ...args: unknown[]) => {
      const id = originalSetTimeout(handler, ms, ...args);
      if (ms && ms > 2000) {
        const resource: TrackedResource = {
          id: ++resourceId,
          type: 'timeout',
          createdAt: Date.now(),
          stackTrace: getStack(),
          label: `${ms}ms timeout`,
          cleared: false,
        };
        timeouts.set(id as unknown as number, resource);
      }
      return id;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).clearTimeout = (id: number) => {
      timeouts.delete(id);
      return originalClearTimeout(id);
    };
  };

  const unpatchTimers = () => {
    window.setInterval = originalSetInterval;
    window.clearInterval = originalClearInterval;
    window.setTimeout = originalSetTimeout;
    window.clearTimeout = originalClearTimeout;
  };

  const trackComponent = (name: string) => {
    return {
      mount: () => {
        const entry = componentMounts.get(name) || {
          mountCount: 0,
          unmountCount: 0,
          currentlyMounted: 0,
        };
        entry.mountCount++;
        entry.currentlyMounted++;
        componentMounts.set(name, entry);

        if (entry.currentlyMounted > 1) {
          log.warn(`Component "${name}" has ${entry.currentlyMounted} concurrent mounts`, {
            totalMounts: entry.mountCount,
            totalUnmounts: entry.unmountCount,
          });
        }
      },
      unmount: () => {
        const entry = componentMounts.get(name);
        if (entry) {
          entry.unmountCount++;
          entry.currentlyMounted = Math.max(0, entry.currentlyMounted - 1);
        }
      },
    };
  };

  const start = () => {
    log.info('Memory Leak Monitor started');
    patchTimers();

    leakCheckInterval = originalSetInterval(() => {
      const longLivedIntervals = Array.from(intervals.values()).filter(
        (r) => Date.now() - r.createdAt > 60000 && !r.cleared
      );

      if (longLivedIntervals.length > 0) {
        log.info(`Active intervals: ${intervals.size}`, {
          longRunning: longLivedIntervals.map((r) => ({
            label: r.label,
            age: `${Math.round((Date.now() - r.createdAt) / 1000)}s`,
            stack: r.stackTrace,
          })),
        });
      }
    }, 60000);
  };

  const stop = () => {
    unpatchTimers();
    if (leakCheckInterval) originalClearInterval(leakCheckInterval);
    log.info('Memory Leak Monitor stopped');
  };

  const getState = (): MemoryMonitorState => ({
    activeIntervals: intervals.size,
    activeTimeouts: timeouts.size,
    componentMounts: Object.fromEntries(componentMounts),
    intervalDetails: Array.from(intervals.values()).map((r) => ({
      label: r.label,
      age: `${Math.round((Date.now() - r.createdAt) / 1000)}s`,
      stack: r.stackTrace,
    })),
  });

  return { start, stop, getState, trackComponent };
}
