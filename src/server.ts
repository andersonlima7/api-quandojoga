import fastify from 'fastify';
import { env } from './env';
import { teamsRoutes } from './routes/teams';
import { matchesRoutes } from './routes/matches';
import { championshipRoutes } from './routes/championship';

const app = fastify();

const port = env.PORT;

app.register(teamsRoutes, {
  prefix: 'teams'
});
app.register(matchesRoutes, {
  prefix: 'matches'
});

app.register(championshipRoutes, {
  prefix: 'championship'
});

app.get('/', async function (request, reply) {
  reply
    .code(200)
    .header('Content-Type', 'application/json; charset=utf-8')
    .send({ hello: 'world' });
});

app
  .listen({ port: env.PORT })
  .then(() => console.log(`Http server is running on ${port}`));
