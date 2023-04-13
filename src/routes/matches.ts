import { FastifyInstance } from 'fastify';
import { knex } from '../database';
import { z } from 'zod';
import moment from 'moment';

export async function matchesRoutes(app: FastifyInstance) {
  // Returns all matches registered.
  app.get('/', async () => {
    const matches = await knex('matches').select('*');
    return matches;
  });

  // Returns all matches in a month/year combination
  // FIXME: FIX THIS ROUTE
  app.get('/:year/:month', async request => {
    const requestSchema = z.object({
      month: z.string(),
      year: z.string()
    });

    const { year, month } = requestSchema.parse(request.params);

    const startDate = moment(`01-${month}-20${year}`, 'DD-MM-YYYY').format(
      'DD-MM-YYYY'
    );
    const finishDate = moment(`03-${month}-20${year}`, 'DD-MM-YYYY').format(
      'DD-MM-YYYY'
    );

    const matches = await knex('matches')
      .where('date', '>', startDate)
      .andWhere('date', '<', finishDate)
      .select('*');

    return matches;
  });

  // Returns all matches in a day/month/year combination
  app.get('/:year/:month/:day', async request => {
    const requestSchema = z.object({
      day: z.string(),
      month: z.string(),
      year: z.string()
    });

    const { day, year, month } = requestSchema.parse(request.params);
    const date = `${day}-${month}-20${year}`;

    console.log(date);

    const matches = await knex('matches').where('date', date).select('*');

    return matches;
  });

  // Returns all matches of a team.
  app.get('/:team_name', async request => {
    const requestSchema = z.object({
      team_name: z.string()
    });

    const { team_name } = requestSchema.parse(request.params);

    const matches = await knex('matches')
      .where('team_home', team_name)
      .orWhere('team_away', team_name)
      .select('*');

    return matches;
  });

  // Returns all matches of a championship.
  app.get('/championship/:championship', async request => {
    const requestSchema = z.object({
      championship: z.string()
    });

    const { championship } = requestSchema.parse(request.params);

    console.log(championship);

    const matches = await knex('matches')
      .where('championship', championship)
      .select('*');

    return matches;
  });
}
