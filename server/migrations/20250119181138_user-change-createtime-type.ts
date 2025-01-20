import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  knex.schema.alterTable('user', (table) => {
    table.timestamp('createTime', { useTz: false }).alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  knex.schema.alterTable('user', (table) => {
    table.timestamp('createTime', { useTz: true }).alter();
  });
}
