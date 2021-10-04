import { createConnectionPool } from '../createConnectionPool';

const knexConfig = require('../../../../knexfile');

export async function bootstrapDB(): Promise<void> {
  const dbClient = createConnectionPool();
  await dbClient.migrate.latest(knexConfig);
  await dbClient.destroy();
}

export async function teardownDB(): Promise<void> {
  const dbClient = createConnectionPool();
  await dbClient.migrate.rollback(knexConfig, true); // Rollback all migrations
  await dbClient.destroy();
}

export async function truncateTable(): Promise<void> {
  const dbClient = createConnectionPool();

  //await dbClient.raw('TRUNCATE TABLE comments');

  await dbClient.destroy();
}
