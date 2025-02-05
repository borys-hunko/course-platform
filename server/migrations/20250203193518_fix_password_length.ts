import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.table('user', (table) => {
    table.string('password', 70).alter();
  });
}

// eslint-disable-next-line
export async function down(knex: Knex): Promise<void> {
  // return knex.schema.table('user', (table) => {
  //   table.string('password', 40).alter();
  // });
}
