import { logger } from '@/server/Logger.js';

const Runtime = async (sandbox: () => void) => {
  // Catch unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    logger.error('[RUNTIME] Unhandled Rejection found!:');
    logger.error(err);
    process.exit(1);
  });

  // Catch unhandled exceptions
  process.on('uncaughtException', (err) => {
    logger.error('[RUNTIME] Uncaught Exception found!:');
    logger.error(err);
    process.exit(1);
  });

  // Start a runtime
  sandbox();
};

export { Runtime };
