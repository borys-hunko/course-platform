import { Knex } from 'knex';

type Envs = 'development';

const knexConfig: Record<Envs, Knex.Config> = {
  development: {
    client: 'pg',
    connection: {
      host: 'db',
      port: 5432,
      user: 'borys',
      password: 'password',
      database: 'courses_side',
    },
    migrations: {
      extension: 'ts',
      tableName: 'migrations',
    },
    debug: true,
  },
};

export default knexConfig;
