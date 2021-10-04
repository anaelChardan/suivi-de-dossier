import path from 'path';
import config from 'config';
import { Knex } from 'knex';

const { resolve } = path;

const connection: Knex.PgConnectionConfig = {
  connectionString: process.env.DATABASE_URL || config.get('postgres'),
};

const knexConfig: Knex.Config = {
  client: 'postgresql',
  connection,
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    extension: 'ts',
    tableName: 'knex_migrations',
    schemaName: 'public',
    loadExtensions: ['.js'],
    directory: [resolve(__dirname, './src/infrastructure/database/migrations')],
  },
};

export default knexConfig;
