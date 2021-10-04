import VError from 'verror';
import { Context, Next } from 'koa';

export const errorMiddleware = async (
  ctx: Context,
  next: Next,
): Promise<void> => {
  try {
    await next();
  } catch (err) {
    const errorObject = err as {
      message?: string;
      status?: number;
      name?: string;
    };
    const error = err instanceof VError ? err : new VError(errorObject.message);
    ctx.state.deps.logger.error(error.message, {
      error: {
        info: VError.info(error),
        stacktrace: VError.fullStack(error),
      },
    });

    ctx.status = errorObject.status || 500;

    ctx.body = {
      outcome: 'FAILURE',
      error: errorObject.name || 'UNKNOWN_ERROR',
      reason: errorObject.message,
      infos: errorObject.status === 400 ? err : undefined,
    };
  }
};
