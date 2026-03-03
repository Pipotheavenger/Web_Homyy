'use client';

import React from 'react';
import { createLogger, exportLogs } from '../utils/logger';

const log = createLogger('ERROR');

interface ErrorBoundaryProps {
  children: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  timestamp: string | null;
}

export class DebugErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      timestamp: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      timestamp: new Date().toISOString(),
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });

    log.error('React Error Boundary caught an error', {
      error: error.message,
      stack: error.stack?.split('\n').slice(0, 5).join('\n'),
      componentStack: errorInfo.componentStack?.split('\n').slice(0, 10).join('\n'),
    });

    if (
      error.message?.includes('Refresh Token') ||
      error.message?.includes('autenticado') ||
      error.message?.includes('AuthApiError') ||
      error.message?.includes('session')
    ) {
      log.error('*** This crash is likely caused by an AUTH/SESSION issue ***', {
        suggestion: 'Check the Auth Session Monitor for token expiry or refresh failures',
      });
    }

    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      timestamp: null,
    });
  };

  handleCopyLogs = () => {
    const data = {
      error: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: this.state.timestamp,
      recentLogs: exportLogs(),
      url: typeof window !== 'undefined' ? window.location.href : '',
    };
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
  };

  handleSignOut = async () => {
    try {
      const { supabase } = await import('@/lib/supabase');
      await supabase.auth.signOut();
      window.location.href = '/login';
    } catch {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/login';
    }
  };

  render() {
    if (this.state.hasError) {
      const isAuthError =
        this.state.error?.message?.includes('Refresh Token') ||
        this.state.error?.message?.includes('autenticado') ||
        this.state.error?.message?.includes('AuthApiError');

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {isAuthError ? 'Error de Sesion' : 'Algo salio mal'}
              </h2>
              <p className="text-gray-600 text-sm mb-4">
                {isAuthError
                  ? 'Tu sesion ha expirado o es invalida. Por favor inicia sesion nuevamente.'
                  : this.state.error?.message || 'Error inesperado en la aplicacion'}
              </p>
            </div>

            <details className="bg-gray-50 rounded-xl p-4">
              <summary className="text-sm font-medium text-gray-700 cursor-pointer">
                Informacion de depuracion
              </summary>
              <div className="mt-3 space-y-2 text-xs font-mono text-gray-500 max-h-48 overflow-auto">
                <p>
                  <strong>Error:</strong> {this.state.error?.message}
                </p>
                <p>
                  <strong>Timestamp:</strong> {this.state.timestamp}
                </p>
                <pre className="whitespace-pre-wrap break-words">
                  {this.state.error?.stack?.split('\n').slice(0, 5).join('\n')}
                </pre>
              </div>
            </details>

            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleRetry}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                Intentar de nuevo
              </button>

              {isAuthError && (
                <button
                  onClick={this.handleSignOut}
                  className="w-full py-3 border-2 border-purple-500 text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-all"
                >
                  Cerrar sesion e iniciar de nuevo
                </button>
              )}

              <button
                onClick={this.handleCopyLogs}
                className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-all"
              >
                Copiar logs de depuracion
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
