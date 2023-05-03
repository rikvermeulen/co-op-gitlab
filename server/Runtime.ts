import { Logger } from '@/server/Logger.js';

const Runtime = async (sandbox: () => void) => {
  // Catch unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    Logger.error('[RUNTIME] Unhandled Rejection found!:');
    Logger.error(err);
    process.exit(1);
  });

  // Catch unhandled exceptions
  process.on('uncaughtException', (err) => {
    Logger.error('[RUNTIME] Uncaught Exception found!:');
    Logger.error(err);
    process.exit(1);
  });

  // Start a runtime
  sandbox();
};

export { Runtime };
