import type { Context, ParameterizedContext } from 'koa';
import { v4 as uuidV4 } from 'uuid';
import { ContinuationLocalStorage } from '../../storage/continuationLocalStorage';
const correlationIdHeader = 'x-correlation-id';

type InjectCorrelationIdMiddleware = (
  context: Context,
  next: () => Promise<void>,
) => void;

export function buildInjectCorrelationIdMiddleware(
  correlationIdStorage: ContinuationLocalStorage<string>,
): InjectCorrelationIdMiddleware {
  return async (
    context: ParameterizedContext<object>,
    next: () => Promise<void>,
  ): Promise<void> => {
    const requestCorrelationId = context.request.get(correlationIdHeader);
    const correlationId = requestCorrelationId || uuidV4();
    context.state = {
      correlationId,
    };
    correlationIdStorage.bindEmitter(context.req);
    correlationIdStorage.bindEmitter(context.res);
    await correlationIdStorage.set(correlationId, context, next);
  };
}
