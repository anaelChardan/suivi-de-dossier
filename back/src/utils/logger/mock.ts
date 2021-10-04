import { Logger } from './logger';

export const silentLogger: Logger = {
  debug() {},
  info() {},
  warn() {},
  error() {},
};
