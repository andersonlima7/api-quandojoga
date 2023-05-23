import { FastifyInstance } from 'fastify';
import { knex } from '../database';
import { z } from 'zod';
import moment from 'moment';
import 'moment-timezone';

export async function matchesRoutes(app: FastifyInstance) {
  moment.locale('pt-br');

  // Configure o fuso horário para o Brasil

  moment.tz.setDefault('America/Sao_Paulo');

  const enumerateDaysBetweenDates = (startDate: string, endDate: string) => {
    const dates = [];

    const currDate = moment(startDate, 'DD-MM-YY').startOf('day');
    const lastDate = moment(endDate, 'DD-MM-YY').startOf('day');

    while (currDate.add(1, 'days').diff(lastDate) <= 0) {
      dates.push(currDate.clone().format('DD/MM/YY'));
    }

    return dates;
  };

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

    let correctDate = date;

    if (/^\d{2}-\d{2}-\d{2}$/.test(date)) {
      const digits = date.split('-');
      correctDate = `${digits[0]}/${digits[1]}/${digits[2]}`;

      const today = moment();
      const tomorrow = today.clone().add(1, 'days');
      if (today.format('DD-MM-YY') === date) correctDate = 'Hoje';
      else if (tomorrow.format('DD-MM-YY') === date) correctDate = 'Amanhã';
    }

    console.log(date);
    console.log(correctDate);

    const matches = await knex('matches')
      .whereRaw('lower(date) = ?', correctDate.toLowerCase())
      .select('*');

    return matches;
  });

  // Returns all matches of a date range
  app.get('/date/range/:first_date/:last_date', async request => {
    const requestSchema = z.object({
      first_date: z.string(),
      last_date: z.string()
    });

    const { first_date, last_date } = requestSchema.parse(request.params);

    let firstDate = first_date;
    let datesRange = [];

    if (first_date.toLowerCase() === 'hoje') {
      firstDate = moment().format('DD-MM-YY');
      datesRange.push('Hoje', 'Amanhã');
    } else {
      const digitsDate = first_date.split('-');
      const formattedDate = `${digitsDate[0]}/${digitsDate[1]}/${digitsDate[2]}`;
      datesRange.push(formattedDate);
    }

    const dates = enumerateDaysBetweenDates(firstDate, last_date);
    datesRange = datesRange.concat(dates);

    const matches = await knex('matches')
      .whereIn('date', datesRange)
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

    const matches = await knex('matches')
      .whereRaw('lower(championship) = ?', championship)
      .select('*');

    return matches;
  });
}
