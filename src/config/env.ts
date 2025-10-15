import dotenv from 'dotenv';

dotenv.config();

const nodeEnv = process.env.NODE_ENV ?? 'development';

export const env = {
  nodeEnv,
  port: Number(process.env.PORT ?? 3000),
  sessionSecret: process.env.SESSION_SECRET ?? 'change-me',
  databaseUrl: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/letsdoo',
  storageDriver: process.env.STORAGE_DRIVER ?? 'local',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? '',
  baseUrl: process.env.BASE_URL ?? 'http://localhost:3000',
};

export const isProd = env.nodeEnv === 'production';
