import { FastifyInstance } from 'fastify';
import { knex } from '../database';
import { z } from 'zod';

export async function matchesRoutes(app: FastifyInstance) {
  // Returns all matches registered.
  app.get('/', async () => {
    const matches = await knex('matches').select('*');
    return matches;
  });

  // Returns all matches in a month/year combination
  app.get('/date/month/:month_year', async request => {
    const requestSchema = z.object({
      month_year: z.string()
    });

    const { month_year } = requestSchema.parse(request.params);

    const digits = month_year.split('-');
    const month = digits[0];
    const year = digits[1];

    const matches = await knex('matches')
      .whereRaw('substr(date, 4, 2) = ?', [month])
      .andWhereRaw('substr(date, 7, 5) = ?', [year])
      .select('*');

    return matches;
  });

  // Returns all matches of a date
  app.get('/date/:date', async request => {
    const requestSchema = z.object({
      date: z.string()
    });

    const { date } = requestSchema.parse(request.params);

    console.log(date);

    let correctDate = date;

    if (/^\d{2}-\d{2}-\d{2}$/.test(date)) {
      const digits = date.split('-');
      correctDate = `${digits[0]}/${digits[1]}/${digits[2]}`;
    }

    const matches = await knex('matches')
      .whereRaw('lower(date) = ?', correctDate.toLowerCase())
      .select('*');

    return matches;
  });

  // Returns all matches of a team.
  app.get('/:team_name', async request => {
    const requestSchema = z.object({
      team_name: z.string()
    });

    const team_name = requestSchema
      .parse(request.params)
      .team_name.toLowerCase();

    const matches = await knex('matches')
      .whereRaw('lower(team_home) = ?', team_name)
      .orWhereRaw('lower(team_away) = ?', team_name)
      .select('*');

    return matches;
  });

  // Returns all matches of a championship.
  app.get('/championship/:championship', async request => {
    const requestSchema = z.object({
      championship: z.string()
    });

    const championship = requestSchema
      .parse(request.params)
      .championship.toLowerCase();

    console.log(championship);

    const matches = await knex('matches')
      .whereRaw('lower(championship) = ?', championship)
      .select('*');

    return matches;
  });
}
