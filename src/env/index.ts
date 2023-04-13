import 'dotenv/config';
import { z } from 'zod';

// process.env

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('production'),

  DATABASE_CLIENT: z.enum(['sqlite', 'pg']),
  DATABASE_URL: z.string(),
  PORT: z.coerce.number().default(3333)
});

export const env = envSchema.parse(process.env);
