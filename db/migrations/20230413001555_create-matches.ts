import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return await knex.schema.createTable('matches', table => {
    table.uuid('id').primary();
    table.text('team_home').notNullable();
    table.text('team_home_logo').notNullable();
    table.text('team_away').notNullable();
    table.text('team_away_logo').notNullable();
    table.text('date').notNullable();
    table.text('time').notNullable();
    table.text('championship').notNullable();
    table.text('championship_logo').notNullable();
    table.text('location');
    table.text('description');
    table.text('tv');
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return await knex.schema.dropTable('matches');
}
