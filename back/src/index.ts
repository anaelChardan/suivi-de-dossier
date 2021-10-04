import config from 'config';
import os from 'os';
import { createConnectionPool } from './infrastructure/database/createConnectionPool';
import { buildApp } from './presentation/app';
import { loggerFactory } from './utils/logger';

// Build dependencies

const logger = loggerFactory.createLogger({ serviceName: 'default' });

const db = createConnectionPool();

// Build app

const appDependencies = {
  logger,
  db,
};
const app = buildApp(appDependencies);

// Setup server

const server = app.listen(
  process.env.PORT || config.get('app.port') || 80,
  () => {
    logger.info(
      `Server running - ENV:${process.env.NODE_ENV} - PORT:${config.get(
        'app.port',
      )}`,
    );
    logger.info('[Server information]', {
      platform: os.platform(),
      osRelease: os.release(),
      totalMemory: `${(os.totalmem() / 1024 ** 3).toFixed(2)} GB`, // bytes to GB
    });
  },
);

server.on('close', () => {
  logger.info('SERVER SHUTDOWN');
  logger.end();
});

async function exitGracefully(
  eventName: NodeJS.Signals | 'uncaughtException',
  exitCode: number,
  error?: Error,
): Promise<void> {
  if (error) {
    logger.error('Error while exiting: ' + error.message, { error });
  }
  logger.info(`Exit Gracefully Received "${eventName}" event`, {
    eventName,
    exitCode,
  });

  server.close();
  await db.destroy();
  logger.on('finish', () => {
    process.exit(exitCode);
  });
}

process.on('SIGTERM', () => exitGracefully('SIGTERM', 0));
process.on('SIGINT', () => exitGracefully('SIGINT', 0));
process.on('uncaughtException', (err: Error) =>
  exitGracefully('uncaughtException', 1, err),
);
