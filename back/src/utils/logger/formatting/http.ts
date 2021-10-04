import type { Logger } from '../logger';

type Context = {
  request: {
    ip?: string;
    method: string;
    url: string;
    path: string;
    origin: string;
    originalUrl: string;
    querystring?: string;
    get?(attribute: 'User-Agent'): string;
  };
  response: {
    status: number;
  };
};

export function logHttpRequest(
  logger: Logger,
  context: Omit<Context, 'response'>,
  extra?: {
    postfix?: string;
    metadata?: object;
  },
): void {
  const { message, metadata } = transform(context.request);
  logger.debug(`HTTP REQ - ${message} ${extra?.postfix || ''}`, {
    ...metadata,
    ...(extra?.metadata ?? {}),
  });
}

export function logHttpResponse(
  logger: Logger,
  context: Context,
  responseTime?: number,
  extra?: {
    metadata?: object;
  },
): void {
  const { message, metadata } = transform(
    context.request,
    context.response,
    responseTime,
  );
  const { status } = context.response;
  const readableResponseTime = responseTime
    ? getReadableTime(responseTime)
    : undefined;
  logger.debug(
    `HTTP RES - ${message} ${status} ${readableResponseTime || ''}`,
    {
      ...metadata,
      ...(extra?.metadata ?? {}),
    },
  );
}

function transform(
  request: Context['request'],
  response?: Context['response'],
  responseTime?: number,
): { message: string; metadata: object } {
  const method = request.method.toUpperCase();
  const message = `${method} ${request.path}`;

  const metadata: Record<string, string | number | undefined> = {};
  metadata.clientIp = request.ip;
  metadata.method = method;
  metadata.url = request.url;
  metadata.path = request.path;
  metadata.origin = request.origin;
  metadata.originalUrl = request.originalUrl;
  metadata.querystring = request.querystring;
  metadata.userAgent = request.get?.('User-Agent');

  if (response) {
    metadata.statusCode = response.status;
    metadata.responseTime = responseTime;
  }

  return { message, metadata };
}

function getReadableTime(time: number): string {
  return time < 10000 ? `${time}ms` : `${Math.round(time / 1000)}s`;
}
