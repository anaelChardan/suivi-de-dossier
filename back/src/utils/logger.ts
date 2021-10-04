import config from 'config';
import {
  buildHttpLoggerMiddleware,
  buildInjectCorrelationIdMiddleware,
  buildLoggerFactory,
} from './logger/index';
import { buildContinuationLocalStorage } from './storage';

const correlationIdStorage = buildContinuationLocalStorage<string>({
  storeKey: 'correlationId',
});

const globalContext = {
  env: process.env.NODE_ENV ?? 'local',
  package: 'todoproject',
  version: '1.0.0', // TODO: Use version from package.json
};

export const loggerFactory = buildLoggerFactory({
  config: {
    enableConsoleTransport: config.get('logger.console'),
    enableStdoutTransport: config.get('logger.stdout'),
    enableFileTransport: false,
  },
  globalContext,
  getContext() {
    return {};
  },
  getCorrelationId() {
    return correlationIdStorage.get() ?? '';
  },
});

export const injectCorrelationIdMiddleware =
  buildInjectCorrelationIdMiddleware(correlationIdStorage);

export const httpLoggerMiddleware = buildHttpLoggerMiddleware({
  logger: loggerFactory.createLogger({ serviceName: 'http' }),
});
