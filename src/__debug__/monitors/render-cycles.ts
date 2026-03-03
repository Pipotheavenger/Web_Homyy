'use client';

import { createLogger } from '../utils/logger';
import { useRef, useEffect } from 'react';

const log = createLogger('RENDER');

export interface RenderEntry {
  componentName: string;
  renderCount: number;
  lastRenderAt: number;
  rendersInLastSecond: number;
  props?: string[];
}

const renderRegistry = new Map<
  string,
  {
    count: number;
    timestamps: number[];
    lastProps?: Record<string, unknown>;
  }
>();

export function useRenderTracker(componentName: string, props?: Record<string, unknown>) {
  const renderCount = useRef(0);
  const prevProps = useRef<Record<string, unknown> | undefined>(undefined);

  renderCount.current++;

  const now = Date.now();
  const entry = renderRegistry.get(componentName) || { count: 0, timestamps: [] };
  entry.count++;
  entry.timestamps.push(now);
  entry.lastProps = props;

  entry.timestamps = entry.timestamps.filter((t) => now - t < 5000);
  renderRegistry.set(componentName, entry);

  if (entry.timestamps.length > 10) {
    log.warn(`Excessive re-renders: ${componentName}`, {
      rendersIn5s: entry.timestamps.length,
      totalRenders: entry.count,
    });
  }

  if (props && prevProps.current) {
    const changedProps: string[] = [];
    for (const key of Object.keys(props)) {
      if (props[key] !== prevProps.current[key]) {
        changedProps.push(key);
      }
    }
    if (changedProps.length > 0 && renderCount.current > 2) {
      log.debug(`${componentName} re-rendered due to prop changes`, {
        changedProps,
        renderCount: renderCount.current,
      });
    }
  }

  prevProps.current = props ? { ...props } : undefined;

  useEffect(() => {
    const ref = renderCount;
    return () => {
      if (ref.current > 20) {
        log.info(`${componentName} unmounted after ${ref.current} renders`);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export function getRenderState(): RenderEntry[] {
  const now = Date.now();
  return Array.from(renderRegistry.entries())
    .map(([name, data]) => ({
      componentName: name,
      renderCount: data.count,
      lastRenderAt: data.timestamps[data.timestamps.length - 1] || 0,
      rendersInLastSecond: data.timestamps.filter((t) => now - t < 1000).length,
      props: data.lastProps ? Object.keys(data.lastProps) : undefined,
    }))
    .sort((a, b) => b.renderCount - a.renderCount);
}

export function clearRenderState(): void {
  renderRegistry.clear();
}
