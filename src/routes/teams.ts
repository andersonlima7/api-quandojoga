import { FastifyInstance } from 'fastify';
import { knex } from '../database';
import { z } from 'zod';

export async function teamsRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const teams = await knex('teams').select('*');
    return teams;
  });

  app.get('/:name', async request => {
    const requestSchema = z.object({
      name: z.string()
    });
    const { name } = requestSchema.parse(request.params);

    const teams = await knex('teams')
      .select('*')
      .whereRaw('lower(name) = ?', name.toLowerCase());

    return teams;
  });
}
