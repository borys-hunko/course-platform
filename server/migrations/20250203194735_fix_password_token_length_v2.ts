import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw('ALTER TABLE ?? ALTER COLUMN ?? TYPE VARCHAR(70)', [
    'user',
    'password',
  ]);
}
// eslint-disable-next-line
export async function down(knex: Knex): Promise<void> {
  // await knex.raw('ALTER TABLE ?? ALTER COLUMN ?? TYPE VARCHAR(40)', [
  //   'user',
  //   'password',
  // ]);
}
