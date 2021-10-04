import { AppDependencies } from '../../presentation/app';

export type SuiviDeDossierApp = AppDependencies & {};

export const buildSuiviDeDossierApp = (
  appDependencies: AppDependencies,
): SuiviDeDossierApp => {
  return {
    ...appDependencies,
  };
};
