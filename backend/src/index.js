// Server entry point. Connects DB, starts HTTP server, wires up signals.
const app = require('./app');
const config = require('./config/env');
const { connectDB, disconnectDB } = require('./config/db');
const logger = require('./utils/logger');

const start = async () => {
  try {
    await connectDB();
    const server = app.listen(config.port, () => {
      logger.info(`MockMate API listening on http://localhost:${config.port} (${config.env})`);
    });

    const shutdown = async (signal) => {
      logger.info(`${signal} received – shutting down…`);
      server.close(async () => {
        await disconnectDB();
        process.exit(0);
      });
      // Force-exit after 10s if shutdown stalls
      setTimeout(() => process.exit(1), 10_000).unref();
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('unhandledRejection', (err) => {
      logger.error('Unhandled rejection', { message: err?.message });
    });
  } catch (err) {
    logger.error('Failed to start server', { message: err.message });
    process.exit(1);
  }
};

start();
