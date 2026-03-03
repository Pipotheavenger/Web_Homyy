type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type MonitorName = 'AUTH' | 'MEMORY' | 'QUERY' | 'NETWORK' | 'RENDER' | 'ERROR' | 'SYSTEM';

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  monitor: MonitorName;
  message: string;
  data?: unknown;
}

const COLORS: Record<MonitorName, string> = {
  AUTH: '#FF6B6B',
  MEMORY: '#FFA726',
  QUERY: '#42A5F5',
  NETWORK: '#66BB6A',
  RENDER: '#AB47BC',
  ERROR: '#EF5350',
  SYSTEM: '#78909C',
};

const LEVEL_METHODS: Record<LogLevel, 'debug' | 'log' | 'warn' | 'error'> = {
  debug: 'debug',
  info: 'log',
  warn: 'warn',
  error: 'error',
};

const LOG_BUFFER_SIZE = 500;
const logBuffer: LogEntry[] = [];

export function createLogger(monitor: MonitorName) {
  const log = (level: LogLevel, message: string, data?: unknown) => {
    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      monitor,
      message,
      data,
    };

    logBuffer.push(entry);
    if (logBuffer.length > LOG_BUFFER_SIZE) {
      logBuffer.shift();
    }

    const time = new Date(entry.timestamp).toISOString().split('T')[1].slice(0, 12);
    const prefix = `%c[${time}] [${monitor}]`;
    const style = `color: ${COLORS[monitor]}; font-weight: bold;`;
    const method = LEVEL_METHODS[level];

    if (data !== undefined) {
      console[method](prefix, style, message, data);
    } else {
      console[method](prefix, style, message);
    }
  };

  return {
    debug: (msg: string, data?: unknown) => log('debug', msg, data),
    info: (msg: string, data?: unknown) => log('info', msg, data),
    warn: (msg: string, data?: unknown) => log('warn', msg, data),
    error: (msg: string, data?: unknown) => log('error', msg, data),
  };
}

export function getLogBuffer(): ReadonlyArray<LogEntry> {
  return logBuffer;
}

export function clearLogBuffer(): void {
  logBuffer.length = 0;
}

export function exportLogs(): string {
  return JSON.stringify(logBuffer, null, 2);
}
