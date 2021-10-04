import type { Context } from 'koa';
import { logHttpRequest, logHttpResponse } from '../formatting/http';
import type { Logger } from '../logger';

type HttpLoggerMiddleware = (
  context: Context,
  next: () => Promise<void>,
) => void;

export function buildHttpLoggerMiddleware({
  logger,
}: {
  logger: Logger;
}): HttpLoggerMiddleware {
  return async function httpLoggerMiddleware(
    context: Context,
    next: () => Promise<void>,
  ): Promise<void> {
    const timeStart = Date.now();

    logHttpRequest(logger, context);

    await next();

    const responseTime = Date.now() - timeStart;
    logHttpResponse(logger, context, responseTime);
  };
}
