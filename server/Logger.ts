const color = (number: number) => {
  return `\x1b[${number}m%s\x1b[0m`;
};

export const logger = {
  error(...args: unknown[]) {
    console.log(color(31), ...args);
  },
  warn(...args: unknown[]) {
    console.log(color(33), ...args);
  },
  info(...args: unknown[]) {
    console.log(color(35), ...args);
  },
  success(...args: unknown[]) {
    console.log(color(32), ...args);
  },
  status(...args: unknown[]) {
    console.log(...args);
  },
};
