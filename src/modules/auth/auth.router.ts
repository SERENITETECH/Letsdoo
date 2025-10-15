import { Router } from 'express';
import { authRateLimiter } from '../../config/rateLimit.js';
import { csrfProtection } from '../../core/middlewares/csrf.js';
import { loginHandler, logoutHandler, meHandler, registerHandler, csrfHandler, elevateToCreator } from './auth.controller.js';

export const authRouter = Router();

authRouter.get('/csrf', csrfProtection, csrfHandler);
authRouter.post('/register', authRateLimiter, csrfProtection, registerHandler);
authRouter.post('/login', authRateLimiter, csrfProtection, loginHandler);
authRouter.post('/logout', csrfProtection, logoutHandler);
authRouter.get('/me', meHandler);
authRouter.post('/upgrade', csrfProtection, elevateToCreator);
