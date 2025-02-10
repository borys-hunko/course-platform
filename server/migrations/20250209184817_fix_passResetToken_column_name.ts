import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE "passResetToken"
      RENAME COLUMN "expirartionDate" TO "expirationDate";
    `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE "passResetToken"
      RENAME COLUMN "expirationDate" TO "expirartionDate";
    `);
}
