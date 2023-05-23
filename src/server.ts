import fastify from 'fastify';
import { env } from './env';
import { teamsRoutes } from './routes/teams';
import { matchesRoutes } from './routes/matches';
import { championshipRoutes } from './routes/championship';

const app = fastify();

app.register(teamsRoutes, {
  prefix: 'teams'
});
app.register(matchesRoutes, {
  prefix: 'matches'
});

app.register(championshipRoutes, {
  prefix: 'championship'
});

// Rota especial para listar todos os endpoints
app.get('/endpoints', (req, res) => {
  const routes = app.printRoutes();
  res.send(routes);
});

app.get('/', async () => {
  const routes = {
    matches: [
      {
        url: 'https://www-matches-api.onrender.com/matches',
        description: 'Retorna todas as partidas'
      },
      {
        url: 'https://www-matches-api.onrender.com/matches/year/month/day',
        urlExample: 'https://www-matches-api.onrender.com/matches/23/04/15',
        description: 'Retorna todas as partidas da data determinada'
      },
      {
        url: 'https://www-matches-api.onrender.com/matches/:team',
        urlExample: 'https://www-matches-api.onrender.com/matches/Bahia',
        description: 'Retorna todas as partidas de um time'
      },
      {
        url: 'https://www-matches-api.onrender.com/matches/championship/:championship',
        urlExample:
          'https://www-matches-api.onrender.com/matches/championship/Campeonato%20Brasileiro',
        description: 'Retorna todas as partidas de um campeonato'
      }
    ],
    teams: [
      {
        url: 'https://www-matches-api.onrender.com/teams',
        description: 'Retorna todos os times cadastrados'
      },
      {
        url: 'https://www-matches-api.onrender.com/teams/:name',
        urlExample: 'https://www-matches-api.onrender.com/teams/Corinthians',
        description: 'Retorna um time pelo nome'
      }
    ]
  };
  return routes;
});

app.listen({ port: env.PORT }).then(() => console.log('HTTP Server Running!'));
