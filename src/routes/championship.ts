import { FastifyInstance } from 'fastify';
import { knex } from '../database';

import { z } from 'zod';

export async function championshipRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const championships = await knex('matches')
      .distinct('championship')
      .select('championship', 'championship_logo');
    return championships;
  });

  app.get('/:name', async request => {
    const requestSchema = z.object({
      name: z.string()
    });
    const { name } = requestSchema.parse(request.params);

    const championship_logo = await knex('matches')
      .select('championship_logo')
      .where('championship', name)
      .limit(1);

    return championship_logo[0];
  });

  app.get('/teams/:name', async request => {
    const requestSchema = z.object({
      name: z.string()
    });
    const { name } = requestSchema.parse(request.params);

    const championships = await knex('matches')
      .distinct('championship')
      .where('team_home', name)
      .orWhere('team_away', name)
      .pluck('championship');

    return championships;
  });
}
