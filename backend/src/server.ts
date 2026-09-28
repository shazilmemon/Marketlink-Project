import app from './app';
import { env } from './config/env';
import { connectDatabase } from './config/database';
import { logger } from './utils/logger';

const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 MarketLink Backend API running on port ${env.PORT} [${env.NODE_ENV}]`);
      logger.info(`🌐 Health Endpoint: http://localhost:${env.PORT}/api/${env.API_VERSION}/health`);
    });

    // Graceful Shutdown Handlers
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Shutting down server gracefully...`);
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('Fatal startup error:', error);
    process.exit(1);
  }
};

startServer();
