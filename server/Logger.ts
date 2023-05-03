const LOG_LEVEL = 'info';

const color = (number: number) => {
  return `\x1b[${number}m%s\x1b[0m`;
};

const timestamp = () => {
  return new Date().toISOString();
};

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  success: 3,
  status: 4,
};

const shouldLog = (level: keyof typeof logLevels) => {
  return logLevels[level] <= logLevels[LOG_LEVEL];
};

export const Logger = {
  error(...args: unknown[]) {
    if (shouldLog('error')) {
      console.log(color(31), `[${timestamp()}] [ERROR]`, ...args);
    }
  },
  warn(...args: unknown[]) {
    if (shouldLog('warn')) {
      console.log(color(33), `[${timestamp()}] [WARN]`, ...args);
    }
  },
  info(...args: unknown[]) {
    if (shouldLog('info')) {
      console.log(color(35), `[${timestamp()}] [INFO]`, ...args);
    }
  },
  success(...args: unknown[]) {
    if (shouldLog('success')) {
      console.log(color(32), `[${timestamp()}] [SUCCESS]`, ...args);
    }
  },
  status(...args: unknown[]) {
    if (shouldLog('status')) {
      console.log(`[${timestamp()}] [STATUS]`, ...args);
    }
  },
};
