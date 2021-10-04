import { Knex } from 'knex';
import Koa from 'koa';
import bodyparser from 'koa-bodyparser';
import compress from 'koa-compress';
import { Logger } from '../utils/logger/index';
import cors from 'koa-cors';
import { errorMiddleware } from './http/middlewares/errorMiddleware';
import { swagger } from './http/middlewares/swagger';
import {
  httpLoggerMiddleware,
  injectCorrelationIdMiddleware,
} from '../utils/logger';
import { buildDependencyInjectorMiddleware } from './http/middlewares/dependencyInjectorMiddleware';
import { buildSuiviDeDossierApp } from '../infrastructure/runtime';
import { buildSuiviDeDossierRouter } from './http/api/buildSuiviDeDossierRouter';

/**
 * @category App
 */
export type AppDependencies = {
  logger: Logger;
  db: Knex;
};

/**
 * @category App
 */
export function buildApp(dependencies: AppDependencies): Koa {
  const app = new Koa();

  const suiviDeDossierApp = buildSuiviDeDossierApp(dependencies);

  // Middlewares
  app
    .use(injectCorrelationIdMiddleware)
    .use(buildDependencyInjectorMiddleware(suiviDeDossierApp))
    .use(httpLoggerMiddleware)
    .use(errorMiddleware)
    .use(bodyparser())
    .use(compress())
    .use(swagger);

  // presentation middlewares
  app.use(cors({ origin: '*' }));

  const suiviDeDossierRouter = buildSuiviDeDossierRouter(suiviDeDossierApp);

  app.use(suiviDeDossierRouter.routes());
  app.use(suiviDeDossierRouter.allowedMethods());

  return app;
}
