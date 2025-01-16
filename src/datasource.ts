import knex from 'knex';
import knexConfig from '../knexfile';

const datasource = knex({
  client: knexConfig.development.client,
  connection: {
    ...knexConfig.development.connection,
  },
});

export default datasource;
