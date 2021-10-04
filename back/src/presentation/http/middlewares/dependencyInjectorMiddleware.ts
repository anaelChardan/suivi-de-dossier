import { Context, Next } from 'koa';

export function buildDependencyInjectorMiddleware<T>(deps: T) {
  return async (ctx: Context, next: Next): Promise<any> => {
    ctx.state.deps = { ...ctx.state.deps, ...deps };
    await next();
  };
}
