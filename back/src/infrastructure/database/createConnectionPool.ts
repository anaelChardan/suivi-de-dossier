import knex, { Knex } from 'knex';

import knexConfig from '../../../knexfile';

export function createConnectionPool<T extends {} = any>(): Knex<T> {
  return knex<T>({
    client: 'pg',
    searchPath: ['knex', 'public'],
    ...knexConfig,
  });
}
