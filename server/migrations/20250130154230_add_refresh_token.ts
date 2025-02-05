import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('refreshToken', (table) => {
    table.bigIncrements('id', { primaryKey: true });
    table.string('token', 50).notNullable();
    table.timestamp('expirationDate', { useTz: false }).notNullable();
    table.bigInteger('userId').notNullable();
    table.boolean('isActive').defaultTo(true).notNullable();

    table
      .foreign('userId', 'refresh_token_to_user_id')
      .references('id')
      .inTable('user')
      .onDelete('CASCADE');
    table.index('token', 'refresh_token_hash', 'hash');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('refreshToken');
}
