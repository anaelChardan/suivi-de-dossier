import { ParameterizedContext } from 'koa';
import Router from 'koa-router';
import { TypeGuardError } from '../helpers/guard';
import { getEntries } from '../helpers/object';
import { RouteHandler } from './handler';
import { toHttpMethod } from './http';
import type { Routing } from './routing';

export function buildKoaRouter<StateT extends object = {}>(
  routing: Routing<StateT>,
): Router<StateT> {
  const router = new Router();

  const execHandler = async (
    handler: RouteHandler<unknown, StateT>,
    context: ParameterizedContext<StateT>,
  ): Promise<void> => {
    const result = await handler({
      method: toHttpMethod(context.method),
      query: context.request.query,
      params: context.params,
      body: context.request.body,
      state: context.state,
    });
    if (result.result) {
      context.response.body = result.result;
    }

    context.response.status = result.status;
  };

  for (const [path, methodHandlers] of getEntries(routing)) {
    for (const [method, handler] of getEntries(methodHandlers)) {
      if (!handler) {
        continue;
      }

      switch (method) {
        case 'get':
          router.get(path, async (context) => execHandler(handler, context));
          break;
        case 'post':
          router.post(path, async (context) => execHandler(handler, context));
          break;
        case 'put':
          router.put(path, async (context) => execHandler(handler, context));
          break;
        case 'patch':
          router.patch(path, async (context) => execHandler(handler, context));
          break;
        case 'delete':
          router.delete(path, async (context) => execHandler(handler, context));
          break;
        default:
          throw new TypeGuardError(method, 'Unknown HTTP method');
      }
    }
  }

  return router;
}
