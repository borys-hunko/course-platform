import knex from 'knex';
import knexConfig from '../knexfile';

const datasource = knex(knexConfig.development);

console.log('config', JSON.stringify(knexConfig.development.connection));

export default datasource;
