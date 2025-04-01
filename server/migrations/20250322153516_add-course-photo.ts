import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.transaction(async (trx) => {
    try {
      await trx.schema.table('course', (table) => {
        table.string('imageHash', 50).nullable();
        table.boolean('isPictureMinified').defaultTo(false);
        return table;
      });
      await trx.schema.table('course', (table) => {
        table.string('imageUrl', 70).alter();
        table.renameColumn('imageUrl', 'picture');
        return table;
      });
      await trx.commit();
    } catch (error) {
      console.error(error);
      await trx.rollback();
    }
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.transaction(async (trx) => {
    try {
      await knex.schema.table('course', (table) => {
        table.dropColumns('imageHash', 'isPictureMinified');
        return table;
      });
      await trx.schema.table('course', (table) => {
        table.string('picture', 200).alter();
        table.renameColumn('picture', 'imageUrl');
        return table;
      });
      await trx.commit();
    } catch (e) {
      console.error(e);
      await trx.rollback();
    }
  });
}
