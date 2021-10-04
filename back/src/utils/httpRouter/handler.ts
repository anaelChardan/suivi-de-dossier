import * as z from 'zod';
import { Logger } from './../logger/index';
import type { HttpMethod } from './http';

export type RouteHandler<O, StateT extends object = {}> = (request: {
  method: HttpMethod;
  query: unknown;
  params: Record<string, string>;
  body: unknown;
  state: StateT;
}) => Promise<{ status: number; result?: O | { error: z.ZodError } }>;

export function buildRouteHandlerFactory<StateT extends object = {}>({
  logger,
}: {
  logger: Logger;
}) {
  return function buildRouteHandler<I = void, O = void>(config: {
    input?: z.ZodType<I>;
    output?: z.ZodType<O>;
    handler(payload: {
      input: I;
      params: Record<string, string>;
      state: StateT;
    }): Promise<{ status: number; result?: O }>;
  }): RouteHandler<O, StateT> {
    return async (
      request: Parameters<RouteHandler<O, StateT>>[0],
    ): ReturnType<RouteHandler<O, StateT>> => {
      const {
        input: inputValidator,
        output: outputValidator,
        handler,
      } = config;

      let input: I | undefined;
      if (inputValidator) {
        const requestInput = ['get', 'delete'].includes(request.method)
          ? request.query
          : request.body;

        const parseResult = inputValidator.safeParse(requestInput);
        if (parseResult.success === false) {
          return { status: 400, result: { error: parseResult.error } };
        }

        input = parseResult.data;
      }

      const { status, result } = await handler({
        input: input as I, // FIXME: shouldn't need the typecast
        params: request.params,
        state: request.state,
      });

      if (result && outputValidator) {
        const parseResult = outputValidator.safeParse(result);
        if (parseResult.success === false) {
          logger.error(`Validation error of the HTTP result payload`, {
            error: parseResult.error,
          });
          return { status: 500 };
        }

        return { status, result: parseResult.data };
      }

      return { status };
    };
  };
}
