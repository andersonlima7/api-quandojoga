import fastify from 'fastify';
import { env } from './env';
import { teamsRoutes } from './routes/teams';
import { matchesRoutes } from './routes/matches';
import { championshipRoutes } from './routes/championship';
import cors from '@fastify/cors';


const app = fastify();

app.register(cors, {
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
});

app.register(teamsRoutes, {
  prefix: 'teams'
});
app.register(matchesRoutes, {
  prefix: 'matches'
});

app.register(championshipRoutes, {
  prefix: 'championship'
});


app.listen({ port: env.PORT }).then(() => console.log('HTTP Server Running!'));
