import os from 'os';
import util from 'util';
import prune from 'json-prune';
import { compact } from 'lodash';
import winston from 'winston';
import {
  FileTransportInstance,
  ConsoleTransportInstance,
} from 'winston/lib/winston/transports';

import { formatErrorEnrich, formatPrune, jsonFormat } from './formatting';

export interface Logger {
  debug(message: string, data?: object): void;
  info(message: string, data?: object): void;
  warn(message: string, data?: object): void;
  error(message: string, data?: object): void;
}

export interface AdvancedLogger extends Logger {
  on(event: string, cb: () => void): void;
  end(): void;
}

export interface LoggerFactory {
  createLogger(context: { serviceName: string }): AdvancedLogger;
}

type Config = {
  enableConsoleTransport: boolean;
  enableStdoutTransport: boolean;
} & (
  | {
      enableFileTransport: true;
      filenamePrefix: string;
      maxFileSize: number;
    }
  | {
      enableFileTransport: false;
    }
);

export function buildLoggerFactory({
  config,
  globalContext,
  getContext,
  getCorrelationId,
}: {
  config: Config;
  globalContext: {
    env: string;
    package: string;
    version: string;
  };
  getContext(): object;
  getCorrelationId(): string;
}): LoggerFactory {
  const defaultMeta = {
    env: globalContext.env,
    label: globalContext.package,
    version: globalContext.version,
    pid: process.pid,
    ppid: process.ppid,
    host: getIpAddress(),
  };

  const transports: (ConsoleTransportInstance | FileTransportInstance)[] = [];
  if (config.enableConsoleTransport) {
    transports.push(createTransportConsole());
  }
  if (config.enableStdoutTransport) {
    transports.push(createTransportStdout());
  }
  if (config.enableFileTransport) {
    transports.push(
      createTransportFile({
        filenamePrefix: config.filenamePrefix,
        maxSize: config.maxFileSize,
      }),
    );
  }

  for (const transport of transports) {
    transport.on('error', (error: Error) => {
      // eslint-disable-next-line no-console
      console.error(
        `Unable to log to transport=${transport.name}: ${
          error.message
        } ${JSON.stringify(error)}`,
      );
    });
  }

  const internalLogger = winston.createLogger({
    transports,
    defaultMeta,
    format: winston.format.combine(
      winston.format((info) => {
        return {
          ...getContext(),
          ...info,
          _message: info.message,
          correlationId: getCorrelationId(),
        };
      })(),
      winston.format.splat(),
      winston.format(formatErrorEnrich)({ depth: 5 }),
      winston.format(formatPrune)(),
      winston.format.timestamp(),
    ),
    exitOnError: false,
  });

  function createLogger({
    serviceName,
  }: {
    serviceName: string;
  }): AdvancedLogger {
    const logger = internalLogger.child({ service: serviceName });
    return {
      debug: logger.debug.bind(logger),
      info: logger.info.bind(logger),
      warn: logger.warn.bind(logger),
      error: logger.error.bind(logger),
      on: logger.on.bind(logger),
      end: logger.end.bind(logger),
    };
  }

  return {
    createLogger,
  };
}

const verboseLevels = ['warn', 'error', 'verbose'];

function createTransportConsole(): ConsoleTransportInstance {
  return new winston.transports.Console({
    level: 'debug',
    handleExceptions: true,
    format: winston.format.combine(
      winston.format(jsonFormat)(),
      winston.format((info) => {
        const { level, message, ...others } = info;
        const parts = [message];
        if (Object.keys(others).length > 0 && verboseLevels.includes(level)) {
          const rawOthers = JSON.parse(prune(others));
          parts.push(util.inspect(rawOthers, false, 4, true));
        }
        info.message = compact(parts).join('\n');
        return info;
      })(),
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message, service = '?' }) => {
        const result = `[${timestamp}] ${level} ${service}: ${message}`;
        return result.replace(/\\n/g, '\n');
      }),
    ),
  });
}

function createTransportStdout(): ConsoleTransportInstance {
  return new winston.transports.Console({
    level: 'debug',
    handleExceptions: true,
    format: winston.format.combine(
      winston.format(jsonFormat)(),
      winston.format.timestamp(),
      winston.format.json(),
    ),
  });
}

function createTransportFile({
  filenamePrefix,
  maxSize,
}: {
  filenamePrefix: string;
  maxSize: number;
}): FileTransportInstance {
  return new winston.transports.File({
    level: 'debug',
    maxFiles: 10,
    maxsize: maxSize,
    tailable: true,
    zippedArchive: true,
    filename: `${filenamePrefix}-${process.pid}.log`,
    format: winston.format.combine(
      winston.format(jsonFormat)(),
      winston.format.json(),
    ),
  });
}

function getIpAddress(): string | null {
  const interfaces = Object.values(os.networkInterfaces())
    .flat()
    .filter(<T>(networkInterface: T | undefined): networkInterface is T => {
      return networkInterface !== undefined;
    });

  const mainInterface = interfaces.find(
    ({ family, internal }) => family === 'IPv4' && internal === false,
  );

  return mainInterface ? mainInterface.address : null;
}
