import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return await knex.schema.createTable('teams', table => {
    table.uuid('id').primary();
    table.text('name').notNullable();
    table.text('logo').notNullable();
    table.text('league').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return await knex.schema.dropTable('teams');
}
