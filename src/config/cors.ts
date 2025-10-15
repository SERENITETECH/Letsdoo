import cors from 'cors';
import { env, isProd } from './env.js';

const allowedOrigins = isProd
  ? [env.baseUrl]
  : [env.baseUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'];

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origine non autorisée'));
    }
  },
  credentials: true,
});
