export const DEBUG_MODE = process.env.NEXT_PUBLIC_DEBUG_MODE === 'true';

export { DebugProvider } from './DebugProvider';
export { DebugErrorBoundary } from './components/DebugErrorBoundary';

import { useRenderTracker as _useRenderTracker } from './monitors/render-cycles';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const noopRenderTracker = (_name: string, _props?: Record<string, unknown>) => {
  /* no-op when debug mode is off */
};

export const useRenderTracker: typeof _useRenderTracker = DEBUG_MODE ? _useRenderTracker : noopRenderTracker;
