import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.transaction(async (trx) => {
    try {
      await trx.schema.createTable('courseFts', (table) => {
        table.bigint('courseId').notNullable().unique();
        table.specificType('fulltext', 'tsvector');
        table
          .foreign('courseId')
          .references('id')
          .inTable('course')
          .onDelete('CASCADE');
        table.index('fulltext', 'fts_course_gin', 'gin');
      });
      await trx.raw(
        `
          INSERT INTO "courseFts" ("courseId", "fulltext")
          SELECT c.id as "courseId",
                 setweight(to_tsvector('english', c.name), 'A') ||
                 setweight(to_tsvector('english', c.description), 'B') ||
                 setweight(to_tsvector('english', u.name), 'C')
                      as fulltext
          FROM course as c
                 JOIN "user" as u ON u.id = c."authorId"
        `,
      );
      const res = await trx.raw('CREATE EXTENSION pg_trgm;');
      console.log('create extension', res);
      await trx.commit();
    } catch (e) {
      console.log(e);
      trx.rollback();
    }
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.transaction(async (trx) => {
    try {
      await trx.raw('DROP EXTENSION IF EXISTS pg_trgm;');
      await trx.schema.dropTable('courseFts');
      await trx.commit();
    } catch (e) {
      console.log(e);
      await trx.rollback();
    }
  });
}
