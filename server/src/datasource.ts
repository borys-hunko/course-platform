import knex, { Knex } from 'knex';
import knexConfig from '../knexfile';

const datasource = knex(knexConfig.development);

export type Datasource = Knex<any, unknown[]>;
export default datasource;
