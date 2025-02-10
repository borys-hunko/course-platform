import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.transaction(async (trx) => {
    try {
      // update refresh token table
      await trx.raw(
        `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        ALTER TABLE "refreshToken"
          ALTER COLUMN "token" TYPE VARCHAR(128),
          ADD COLUMN "tokenId" VARCHAR(36) NOT NULL UNIQUE DEFAULT uuid_generate_v4();`,
      );

      // update pass reset token table
      await trx.raw(
        `ALTER TABLE "passResetToken"
          ALTER COLUMN "token" TYPE VARCHAR(128),
          ADD COLUMN "tokenId" VARCHAR(36) NOT NULL UNIQUE DEFAULT uuid_generate_v4();`,
      );
      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.transaction(async (trx) => {
    try {
      // rollback refresh token table
      await trx.raw(
        `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        ALTER TABLE "refreshToken"
          ALTER COLUMN "token" TYPE VARCHAR(50),
          DROP COLUMN IF EXISTS "tokenId"`,
      );

      // rollback pass reset token table
      await trx.raw(
        `ALTER TABLE "passResetToken"
          ALTER COLUMN "token" TYPE VARCHAR(50),
          DROP COLUMN IF EXISTS "tokenId"`,
      );
      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  });
}
