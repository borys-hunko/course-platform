import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return await knex.transaction(async (trx) => {
    try {
      //TAG
      await trx.schema.createTable('tag', (table) => {
        table.increments('id').primary();
        table
          .string('name', 20)
          .unique({ indexName: 'tag_name_unq' })
          .notNullable();
        //add for efficient like asd% operations
        table.index('name', 'tag_name_btree_tpo', {
          storageEngineIndexType: 'btree',
          indexType: 'text_pattern_ops',
        });
      });
      // COURSE
      await trx.schema.createTable('course', (table) => {
        table.increments('id').primary();
        table.string('name', 70).unique().notNullable();
        table.text('description').notNullable();
        table.boolean('isDraft').notNullable().defaultTo(true);
        table.string('imageUrl', 200).nullable();
        table.bigint('authorId').notNullable();
        table
          .foreign('authorId')
          .references('id')
          .inTable('user')
          .onDelete('CASCADE');
      });
      // COURSE_TO_TAG
      await trx.schema.createTable('courseToTag', (table) => {
        table.bigint('tagId').notNullable();
        table.bigint('courseId').notNullable();
        table
          .foreign('tagId')
          .references('id')
          .inTable('tag')
          .onDelete('CASCADE');
        table
          .foreign('courseId')
          .references('id')
          .inTable('course')
          .onDelete('CASCADE');
        table.primary(['tagId', 'courseId']);
      });

      await trx.commit();
    } catch (e: unknown) {
      await trx.rollback();
      throw e;
    }
  });
}

export async function down(knex: Knex): Promise<void> {
  return await knex.transaction(async (trx) => {
    try {
      await trx.schema.dropTable('courseToTag');
      await trx.schema.dropTable('course');
      await trx.schema.dropTable('tag');
      await trx.commit();
    } catch (e) {
      await trx.rollback();
      throw e;
    }
  });
}
