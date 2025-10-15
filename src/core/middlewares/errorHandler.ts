import { NextFunction, Request, Response } from 'express';
import { logger } from '../../config/logger.js';
import { HttpError } from '../errors/httpError.js';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    if (err.status >= 500) {
      logger.error({ err }, 'Erreur serveur');
    }
    return res.status(err.status).json({ error: { code: err.code, message: err.message, details: err.details } });
  }

  logger.error({ err }, 'Erreur non gérée');
  return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Une erreur interne est survenue.' } });
}
