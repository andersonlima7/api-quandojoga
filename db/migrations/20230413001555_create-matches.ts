import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return await knex.schema.createTable('matches', table => {
    table.uuid('id').primary();
    table.text('team_home').notNullable();
    table.text('team_away').notNullable();
    table.text('date');
    table.text('time');
    table.text('championship');
    table.specificType('tv', 'text[]');
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return await knex.schema.dropTable('matches');
}
