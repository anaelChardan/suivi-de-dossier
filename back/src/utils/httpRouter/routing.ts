import type { RouteHandler } from './handler';
import type { HttpMethod } from './http';

export type Routing<S extends object = {}> = {
  [path: string]: {
    [method in HttpMethod]?: RouteHandler<unknown, S>;
  };
};
