import { FastifyInstance } from 'fastify';
import { knex } from '../database';

import { z } from 'zod';

export async function teamsRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const teams = await knex.raw(`
    SELECT DISTINCT team_home AS team, team_home_logo AS logo FROM matches
    UNION
    SELECT DISTINCT team_away AS team, team_away_logo AS logo FROM matches;
  `);
    return teams;
  });

  app.get('/:name', async request => {
    const requestSchema = z.object({
      name: z.string()
    });
    const { name } = requestSchema.parse(request.params);

    const teams = await knex('matches')
      .select(
        knex.raw(
          `
        CASE
          WHEN LOWER(team_home) = LOWER(?) THEN team_home_logo
          WHEN LOWER(team_away) = LOWER(?) THEN team_away_logo
        END AS logo
      `,
          [name, name]
        )
      )
      .from('matches')
      .whereRaw('LOWER(team_home) = LOWER(?) OR LOWER(team_away) = LOWER(?)', [
        name,
        name
      ])
      .limit(1);

    return teams;
  });

  app.get('/championship/:championship', async request => {
    const requestSchema = z.object({
      championship: z.string()
    });

    const { championship } = requestSchema.parse(request.params);

    console.log(championship);

    const teams = await knex('matches')
      .distinct('team_home', 'team_home_logo')
      .select()
      .from('matches')
      .where('championship', championship)
      .union(function () {
        this.distinct('team_away', 'team_away_logo')
          .select()
          .from('matches')
          .where('championship', championship);
      });
    return teams;
  });
}
