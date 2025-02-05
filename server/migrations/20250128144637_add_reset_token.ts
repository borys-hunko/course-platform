import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('passResetToken', (table) => {
    table.bigIncrements('id', { primaryKey: true });
    table.string('token', 50).notNullable();
    table
      .timestamp('expirartionDate', { useTz: false })
      .defaultTo(knex.fn.now())
      .notNullable();
    table.bigInteger('userId').notNullable();
    table.boolean('isUsed').defaultTo(false).notNullable();

    table
      .foreign('userId', 'pass_reset_token_to_user_id')
      .references('id')
      .inTable('user')
      .onDelete('CASCADE');
    table.index('token', 'passResetToken_token_hash', 'hash');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('passResetToken');
}
