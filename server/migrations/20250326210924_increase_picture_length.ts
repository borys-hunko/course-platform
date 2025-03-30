import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.table('course', (table) => {
    table.string('picture', 120).alter();
    return table;
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.table('course', (table) => {
    table.string('picture', 50).alter();
    return table;
  });
}
