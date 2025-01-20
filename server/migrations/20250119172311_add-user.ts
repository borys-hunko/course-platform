import type { Knex } from 'knex';

export async function up(knex: Knex) {
  return knex.schema.createTable('user', (table) => {
    table.increments('id').primary();
    table.string('login', 40).notNullable().unique();
    table.string('email', 40).notNullable().unique();
    table.timestamp('createTime').notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex) {
  return knex.schema.dropTableIfExists('user');
}
