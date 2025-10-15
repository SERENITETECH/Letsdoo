import express from 'express';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import path from 'path';
import { fileURLToPath } from 'url';
import { env, isProd } from './config/env.js';
import { logger } from './config/logger.js';
import { corsMiddleware } from './config/cors.js';
import { helmetMiddleware } from './config/helmet.js';
import { sessionMiddleware } from './core/middlewares/session.js';
import { auditTrail } from './core/middlewares/audit.js';
import { attachCsrfToken } from './core/middlewares/csrf.js';
import { errorHandler } from './core/middlewares/errorHandler.js';
import { notFoundHandler } from './core/middlewares/notFound.js';
import { authRouter } from './modules/auth/auth.router.js';
import { usersRouter } from './modules/users/users.router.js';
import { productsRouter } from './modules/products/products.router.js';
import { versionsRouter } from './modules/versions/versions.router.js';
import { categoriesRouter } from './modules/categories/categories.router.js';
import { ordersRouter } from './modules/orders/orders.router.js';
import { reviewsRouter } from './modules/reviews/reviews.router.js';
import { uploadsRouter } from './modules/uploads/uploads.router.js';
import adminRouter from './modules/admin/admin.router.js';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webDir = path.join(__dirname, 'web');

app.use(pinoHttp({ logger }));
app.use(compression());
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware);
app.use(auditTrail);
app.use(attachCsrfToken);

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/products', productsRouter);
app.use('/api/versions', versionsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/uploads', uploadsRouter);
app.use('/api/admin', adminRouter);

app.use('/storage', express.static(path.join(process.cwd(), 'storage'), { maxAge: '1d' }));
app.use(express.static(webDir, { maxAge: isProd ? '7d' : 0 }));

app.get('/robots.txt', (_req, res) => {
  res.type('text/plain').send('User-agent: *\nAllow: /');
});

app.get('/sitemap.xml', async (_req, res) => {
  res.sendFile(path.join(webDir, 'sitemap.xml'));
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(webDir, 'index.html'));
});

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.port, () => {
  logger.info(`🚀 Letsdoo lancé sur http://localhost:${env.port}`);
});
