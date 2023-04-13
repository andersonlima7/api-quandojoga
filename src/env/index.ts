import 'dotenv/config';
import { z } from 'zod';

// process.env

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('production'),
  DATABASE_URL: z.string(),
  PORT: z.number().default(3333)
});

export const env = envSchema.parse(process.env);
