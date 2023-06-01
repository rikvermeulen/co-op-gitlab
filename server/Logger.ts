import chalk from 'chalk';

enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  SUCCESS = 3,
  STATUS = 4,
}

const LOG_LEVEL: LogLevel = LogLevel.STATUS;

export const Logger = {
  timestamp: () => {
    return new Date().toISOString();
  },

  shouldLog: (level: LogLevel) => {
    return level <= LOG_LEVEL;
  },

  error: (error: Error | string, code?: number) => {
    if (Logger.shouldLog(LogLevel.ERROR)) {
      const errorMessage = error instanceof Error ? error.message : error;
      console.error(chalk.red(`[${Logger.timestamp()}] [ERROR] [${code || '000'}]`), errorMessage);
    }
  },

  warn: (...args: unknown[]) => {
    if (Logger.shouldLog(LogLevel.WARN)) {
      console.warn(chalk.yellow(`[${Logger.timestamp()}] [WARN]`), args.join(' '));
    }
  },

  info: (...args: unknown[]) => {
    if (Logger.shouldLog(LogLevel.INFO)) {
      console.info(chalk.magenta(`[${Logger.timestamp()}] [INFO]`), args.join(' '));
    }
  },

  success: (...args: unknown[]) => {
    if (Logger.shouldLog(LogLevel.SUCCESS)) {
      console.log(chalk.green(`[${Logger.timestamp()}] [SUCCESS]`), args.join(' '));
    }
  },

  status: (...args: unknown[]) => {
    if (Logger.shouldLog(LogLevel.STATUS)) {
      console.log(chalk.blue(`[${Logger.timestamp()}] [STATUS]`), args.join(' '));
    }
  },
};
