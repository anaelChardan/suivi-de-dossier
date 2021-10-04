import { buildKoaRouter, Routing } from '../../../utils/httpRouter';
import { RouterState } from '../../../infrastructure/http/context';
import { SuiviDeDossierApp } from '../../../infrastructure/runtime';
import Router from 'koa-router';

export const buildSuiviDeDossierRouter = (
  suiviDeDossierApp: SuiviDeDossierApp,
): Router => {
  const routing: Routing<RouterState> = {};

  const router = buildKoaRouter<RouterState>(routing);

  return router;
};
