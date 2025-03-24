import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.table('course', (table) => {
    table.renameColumn('imageHash', 'pictureDataUrl');
    return table;
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.table('course', (table) => {
    table.renameColumn('pictureDataUrl', 'imageHash');
    return table;
  });
}
