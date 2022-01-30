import { Knex } from 'knex';
import { createConnectionPool } from '../../infrastructure/database/createConnectionPool';

export async function db<T extends {} = any, R = void>(
  fn: (db: Knex.QueryBuilder<T>) => Promise<R>,
  tableName?: string,
): Promise<R> {
  const db: Knex = createConnectionPool<T>();

  const result = await fn(db(tableName));

  await db.destroy();

  return result;
}

export const rawQuery = async <R>(
  query: string,
  replacement: any,
): Promise<R> => {
  const db: Knex = createConnectionPool();

  const dbResult = await db.raw(query, replacement);

  const result = dbResult.rows;

  await db.destroy();

  return result as R;
};
