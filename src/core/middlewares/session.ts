import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { env, isProd } from '../../config/env.js';

const PgStore = connectPgSimple(session);

export const sessionMiddleware = session({
  store: env.databaseUrl.startsWith('postgres')
    ? new PgStore({ conString: env.databaseUrl })
    : undefined,
  secret: env.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
});
