import fastify from 'fastify';
import { knex } from './database';
import { env } from './env';
import { teamsRoutes } from './routes/teams';
import { matchesRoutes } from './routes/matches';

const app = fastify();

app.register(teamsRoutes, {
  prefix: 'teams'
});
app.register(matchesRoutes, {
  prefix: 'matches'
});

app.listen({ port: env.PORT }).then(() => console.log('HTTP Server Running!'));
